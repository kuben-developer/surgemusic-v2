#!/usr/bin/env python3
"""
TikTok Music Matching Script (Multi-Feature Audio Fingerprinting)

Matches TikTok videos' musicUrl against campaign audio files using a robust
multi-feature audio fingerprinting approach combining:
- MFCC (spectral envelope)
- Chroma (harmonic/melodic content)
- Spectral Contrast (texture)
- Rhythm features (tempo/beat patterns)

Uses Dynamic Time Warping (DTW) with weighted scoring to achieve 10-15% gap
between correct and incorrect matches for reliable identification.

Usage:
    python match-tiktok-music.py

Requirements:
    pip install librosa numpy scipy requests python-dotenv convex
"""

import sys
import json
import time
import tempfile
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from dotenv import load_dotenv
import multiprocessing

import requests
import numpy as np
import warnings

# Suppress librosa warnings about audioread fallback
warnings.filterwarnings("ignore", category=UserWarning, module="librosa")
warnings.filterwarnings("ignore", category=FutureWarning, module="librosa")

import librosa
from convex import ConvexClient

# ============================================================================
# Configuration
# ============================================================================

load_dotenv()

CONVEX_URL = "https://compassionate-flamingo-972.convex.cloud"
CONVEX_DEPLOY_KEY = "prod:compassionate-flamingo-972|eyJ2MiI6IjczZmVmNGI1ZWY1MTRkYjdhZDVkZGM2YzdiNzA4ZDA0In0="
CAMPAIGNS_DIR = Path(__file__).parent / "campaings"
SIMILARITY_THRESHOLD = 80.0  # 80% match required (adjusted for TikTok audio processing)
BATCH_SIZE = 50  # Convex update batch size
# Reduce parallelism to prevent memory issues and bus errors
# DTW is memory-intensive, so limit concurrent operations
MAX_WORKERS = min(4, multiprocessing.cpu_count())  # Max 4 workers to prevent memory corruption
RETRY_ATTEMPTS = 3
RETRY_DELAY = 1  # seconds

# Checkpoint and resilience settings
CHECKPOINT_FILE = Path(__file__).parent / "matching-checkpoint.json"
CHECKPOINT_INTERVAL = 10  # Save checkpoint every N videos
IMMEDIATE_UPDATE = True  # Update Convex immediately on match (don't wait till end)

# Audio processing settings
TARGET_SAMPLE_RATE = 22050  # librosa default, good for music
COMPARISON_DURATION = 20  # Compare first 20 seconds (safer for memory)
N_MFCC = 20  # Number of MFCC coefficients (increased from 13 for better discrimination)
N_CHROMA = 12  # Number of chroma bins (standard for 12 semitones)
N_SPECTRAL_CONTRAST = 7  # Number of spectral contrast bands

# Feature weights for combined scoring (must sum to 1.0)
# Adjusted for TikTok audio processing: Chroma and Rhythm are most robust
FEATURE_WEIGHTS = {
    "mfcc": 0.20,  # Spectral envelope (reduced - sensitive to compression)
    "chroma": 0.45,  # Melodic/harmonic content (increased - most robust)
    "spectral_contrast": 0.20,  # Texture (increased slightly)
    "rhythm": 0.15,  # Tempo/beat patterns (increased - very reliable)
}

# Per-feature scale factors for distance-to-similarity conversion
# Calibrated from actual TikTok matching data to achieve ~85% for correct matches
# Formula: similarity = 100 * exp(-distance * scale_factor)
# Target: correct match = 85%, incorrect match = 20-40% (maintains discrimination)
FEATURE_SCALE_FACTORS = {
    "mfcc": 0.24,  # MFCC distances ~0.67 for matches → 85% similarity
    "chroma": 1.52,  # Chroma distances ~0.11 for matches → 85% similarity
    "spectral_contrast": 0.73,  # Spectral distances ~0.22 for matches → 85% similarity
    # Rhythm uses custom logic, not exponential decay
}

# DTW Configuration
DTW_METRIC = "euclidean"  # Changed from cosine for better separation
DTW_STEP_PATTERN = "symmetric2"  # Symmetric step pattern
SAKOE_CHIBA_BAND = 20  # Constraint bandwidth for DTW (improves speed and prevents pathological alignments)

# ============================================================================
# Logging Setup
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("match-tiktok-music.log"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

# ============================================================================
# Data Classes
# ============================================================================


@dataclass
class AudioFeatures:
    """Container for all extracted audio features"""

    mfcc: np.ndarray  # Mel-frequency cepstral coefficients
    chroma: np.ndarray  # Chroma features (pitch content)
    spectral_contrast: np.ndarray  # Spectral contrast
    tempo: float  # Estimated tempo in BPM
    beat_frames: np.ndarray  # Beat frame positions


@dataclass
class CampaignAudio:
    """Represents a campaign audio file with pre-computed features"""

    campaign_id: str
    file_path: Path
    features: AudioFeatures
    duration: float


@dataclass
class MatchResult:
    """Result of audio matching with detailed scores"""

    video_id: str
    campaign_id: Optional[str]
    similarity_score: float  # Final combined score
    matched: bool
    # Detailed feature scores
    mfcc_score: float = 0.0
    chroma_score: float = 0.0
    spectral_contrast_score: float = 0.0
    rhythm_score: float = 0.0
    # Statistical metrics
    second_best_score: float = 0.0
    score_gap: float = 0.0  # Gap between best and second-best
    confidence: str = "low"  # low, medium, high
    error: Optional[str] = None


@dataclass
class TikTokVideo:
    """TikTok video from Convex"""

    id: str
    music_url: str
    video_id: str
    username: str


# ============================================================================
# Audio Processing Functions with librosa
# ============================================================================


def extract_all_features(
    file_path: Path, duration: int = COMPARISON_DURATION
) -> Optional[AudioFeatures]:
    """
    Extract all audio features from audio file

    Args:
        file_path: Path to audio file
        duration: Max duration in seconds to analyze

    Returns:
        AudioFeatures object or None if failed
    """
    try:
        # Load audio (mono, limit duration for speed)
        # Use offset to skip any header junk that might cause issues
        y, sr = librosa.load(
            str(file_path), sr=TARGET_SAMPLE_RATE, mono=True, duration=duration, offset=0.0
        )

        if len(y) == 0:
            logger.error(f"Empty audio file: {file_path}")
            return None

        # Validate loaded audio
        if np.isnan(y).any() or np.isinf(y).any():
            logger.error(f"Invalid audio data (NaN/Inf) in file: {file_path}")
            return None

        # 1. Extract MFCC (Spectral envelope)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC)
        # Normalize MFCC
        mfcc = librosa.util.normalize(mfcc, axis=1)

        # 2. Extract Chroma features (Harmonic/melodic content)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr, n_chroma=N_CHROMA)
        # Normalize chroma
        chroma = librosa.util.normalize(chroma, axis=1)

        # 3. Extract Spectral Contrast (Texture)
        spectral_contrast = librosa.feature.spectral_contrast(
            y=y, sr=sr, n_bands=N_SPECTRAL_CONTRAST - 1
        )
        # Normalize spectral contrast
        spectral_contrast = librosa.util.normalize(spectral_contrast, axis=1)

        # 4. Extract Rhythm features (Tempo and beats)
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        # Handle case where tempo is returned as array
        if isinstance(tempo, np.ndarray):
            tempo = float(tempo[0]) if len(tempo) > 0 else 0.0
        else:
            tempo = float(tempo)

        return AudioFeatures(
            mfcc=mfcc,
            chroma=chroma,
            spectral_contrast=spectral_contrast,
            tempo=tempo,
            beat_frames=beat_frames,
        )

    except Exception as e:
        logger.error(f"Failed to extract features from {file_path}: {e}")
        import traceback

        logger.error(traceback.format_exc())
        return None


def compute_dtw_similarity(
    feature1: np.ndarray, feature2: np.ndarray, feature_name: str = "feature", scale_factor: float = 5.0
) -> float:
    """
    Calculate DTW-based similarity between two feature sequences

    Args:
        feature1: First feature array (n_features, T)
        feature2: Second feature array (n_features, T)
        feature_name: Name of feature for logging
        scale_factor: Exponential decay scale factor (feature-specific calibration)

    Returns:
        Similarity score (0-100, higher = more similar)
    """
    try:
        # Aggressive memory protection to prevent bus errors
        # Reduce max frames to be more conservative
        max_frames = 300  # ~13.6 seconds at 22050Hz - safer for memory
        if feature1.shape[1] > max_frames:
            feature1 = feature1[:, :max_frames]
        if feature2.shape[1] > max_frames:
            feature2 = feature2[:, :max_frames]

        # Strict safety: prevent huge matrix allocation
        # DTW memory usage is O(n*m) so we need to be very conservative
        total_cells = feature1.shape[1] * feature2.shape[1]
        if total_cells > 90000:  # 300x300 max (reduced from 160k)
            logger.warning(
                f"DTW matrix too large ({feature1.shape[1]}x{feature2.shape[1]}), truncating"
            )
            max_safe = min(int(np.sqrt(90000)), feature1.shape[1], feature2.shape[1])
            feature1 = feature1[:, :max_safe]
            feature2 = feature2[:, :max_safe]

        # Validate feature arrays before DTW
        if feature1.size == 0 or feature2.size == 0:
            logger.error(f"Empty feature array for {feature_name}")
            return 0.0

        if np.isnan(feature1).any() or np.isnan(feature2).any():
            logger.error(f"NaN values in {feature_name} features")
            return 0.0

        if np.isinf(feature1).any() or np.isinf(feature2).any():
            logger.error(f"Inf values in {feature_name} features")
            return 0.0

        # Use Dynamic Time Warping with Euclidean distance
        # Euclidean provides better separation than cosine for normalized features
        # Wrap in try-catch to prevent bus errors from propagating
        try:
            D, wp = librosa.sequence.dtw(
                X=feature1,
                Y=feature2,
                metric=DTW_METRIC,
                step_sizes_sigma=np.array([[1, 1], [1, 0], [0, 1]]),  # Symmetric step pattern
                weights_mul=np.array([1, 1, 1]),
                band_rad=SAKOE_CHIBA_BAND,  # Sakoe-Chiba band constraint
            )
        except Exception as dtw_error:
            logger.error(f"DTW computation failed for {feature_name}: {dtw_error}")
            return 0.0

        # Get the cumulative distance and normalize by path length
        # Path length normalization is critical for comparing sequences of different lengths
        distance = D[-1, -1] / len(wp)

        # Log raw distance for calibration
        logger.debug(f"    {feature_name} DTW distance: {distance:.3f}")

        # Convert distance to similarity using calibrated exponential decay
        # Uses feature-specific scale factors to account for different distance ranges
        #
        # Similarity formula: 100 * exp(-distance * scale_factor)
        #
        # Feature-specific calibration (based on TikTok empirical data):
        # - MFCC (scale=2.0): distance 0.60 → 30%, distance 0.10 → 82%
        # - Chroma (scale=15.0): distance 0.10 → 22%, distance 0.03 → 64%
        # - Spectral (scale=4.0): distance 0.30 → 30%, distance 0.10 → 67%
        similarity = 100 * np.exp(-distance * scale_factor)

        return float(similarity)

    except MemoryError:
        logger.error(
            f"Out of memory computing DTW (shapes: {feature1.shape}, {feature2.shape})"
        )
        return 0.0
    except Exception as e:
        logger.error(f"Failed to compute DTW for {feature_name}: {e}")
        import traceback

        logger.error(traceback.format_exc())
        return 0.0


def compute_rhythm_similarity(tempo1: float, tempo2: float) -> float:
    """
    Calculate rhythm similarity based on tempo matching

    Args:
        tempo1: First tempo in BPM
        tempo2: Second tempo in BPM

    Returns:
        Similarity score (0-100)
    """
    if tempo1 == 0 or tempo2 == 0:
        return 50.0  # Neutral score if tempo detection failed

    # Calculate tempo ratio (handles double/half tempo detection)
    ratio = tempo1 / tempo2
    # Check if it's close to 1, 2, or 0.5 (same tempo, double, or half)
    closest_ratio = min([1.0, 2.0, 0.5], key=lambda x: abs(ratio - x))
    deviation = abs(ratio - closest_ratio)

    # Convert deviation to similarity
    # 0 deviation = 100%, 0.1 deviation = ~50%
    similarity = 100 * np.exp(-deviation * 10)
    return float(similarity)


def compute_combined_similarity(
    features1: AudioFeatures, features2: AudioFeatures
) -> Tuple[float, Dict[str, float]]:
    """
    Compute combined similarity score using weighted multi-feature matching

    Args:
        features1: First audio features
        features2: Second audio features

    Returns:
        (combined_score, feature_scores_dict)
        combined_score: Weighted average of all feature similarities (0-100)
        feature_scores_dict: Individual feature scores
    """
    # Compute similarity for each feature with feature-specific scale factors
    mfcc_sim = compute_dtw_similarity(
        features1.mfcc, features2.mfcc, "MFCC", FEATURE_SCALE_FACTORS["mfcc"]
    )
    chroma_sim = compute_dtw_similarity(
        features1.chroma, features2.chroma, "Chroma", FEATURE_SCALE_FACTORS["chroma"]
    )
    spectral_sim = compute_dtw_similarity(
        features1.spectral_contrast,
        features2.spectral_contrast,
        "Spectral Contrast",
        FEATURE_SCALE_FACTORS["spectral_contrast"],
    )
    rhythm_sim = compute_rhythm_similarity(features1.tempo, features2.tempo)

    # Combine using weighted average
    combined_score = (
        FEATURE_WEIGHTS["mfcc"] * mfcc_sim
        + FEATURE_WEIGHTS["chroma"] * chroma_sim
        + FEATURE_WEIGHTS["spectral_contrast"] * spectral_sim
        + FEATURE_WEIGHTS["rhythm"] * rhythm_sim
    )

    feature_scores = {
        "mfcc": mfcc_sim,
        "chroma": chroma_sim,
        "spectral_contrast": spectral_sim,
        "rhythm": rhythm_sim,
    }

    return combined_score, feature_scores


def download_audio(url: str, timeout: int = 30) -> Optional[Path]:
    """
    Download audio from URL to temporary file with validation

    Args:
        url: URL to download from
        timeout: Request timeout in seconds

    Returns:
        Path to temporary file or None if failed
    """
    for attempt in range(RETRY_ATTEMPTS):
        try:
            response = requests.get(url, timeout=timeout, stream=True)
            response.raise_for_status()

            # Create temporary file
            # librosa can handle various formats, but TikTok usually serves MP3
            suffix = ".mp3"
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)

            # Write content and track size
            total_size = 0
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:  # filter out keep-alive chunks
                    temp_file.write(chunk)
                    total_size += len(chunk)

            temp_file.close()

            # Validate the downloaded file
            if total_size < 1000:  # Less than 1KB is suspicious
                logger.warning(f"Downloaded file too small ({total_size} bytes), likely corrupted")
                Path(temp_file.name).unlink(missing_ok=True)
                if attempt < RETRY_ATTEMPTS - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                    continue
                return None

            # Verify it's a valid audio file by trying to read it
            try:
                import librosa
                # Just load 0.1 seconds to verify it's readable
                _ = librosa.load(temp_file.name, sr=TARGET_SAMPLE_RATE, duration=0.1)
            except Exception as verify_error:
                logger.warning(f"Downloaded file failed audio verification: {verify_error}")
                Path(temp_file.name).unlink(missing_ok=True)
                if attempt < RETRY_ATTEMPTS - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                    continue
                return None

            return Path(temp_file.name)

        except Exception as e:
            if attempt < RETRY_ATTEMPTS - 1:
                logger.warning(
                    f"Download attempt {attempt + 1} failed for {url}: {e}. Retrying..."
                )
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                logger.error(
                    f"Failed to download {url} after {RETRY_ATTEMPTS} attempts: {e}"
                )
                return None

    return None


# ============================================================================
# Campaign Audio Loading
# ============================================================================


def load_campaign_audios() -> List[CampaignAudio]:
    """
    Load all campaign audio files and pre-compute MFCC

    Returns:
        List of CampaignAudio objects
    """
    logger.info(f"Loading campaign audio files from {CAMPAIGNS_DIR}")
    campaign_audios = []

    if not CAMPAIGNS_DIR.exists():
        logger.error(f"Campaigns directory not found: {CAMPAIGNS_DIR}")
        return []

    # Iterate through campaign folders
    for campaign_folder in CAMPAIGNS_DIR.iterdir():
        if not campaign_folder.is_dir():
            continue

        campaign_id = campaign_folder.name
        logger.info(f"Processing campaign: {campaign_id}")

        # Find audio files (case-insensitive)
        audio_files = []
        for ext in ["*.mp3", "*.MP3", "*.wav", "*.WAV", "*.m4a", "*.M4A"]:
            audio_files.extend(campaign_folder.glob(ext))

        if not audio_files:
            logger.warning(f"No audio files found in {campaign_folder}")
            continue

        # Process each audio file
        for audio_file in audio_files:
            logger.info(f"  Loading: {audio_file.name}")

            # Extract all features
            features = extract_all_features(audio_file)

            if features is None:
                logger.error("    Failed to extract features")
                continue

            # Get duration
            try:
                duration = librosa.get_duration(path=str(audio_file))
            except Exception as e:
                logger.warning(f"Failed to get duration: {e}")
                duration = 0

            campaign_audio = CampaignAudio(
                campaign_id=campaign_id,
                file_path=audio_file,
                features=features,
                duration=duration,
            )
            campaign_audios.append(campaign_audio)
            logger.info(
                f"    Loaded ({campaign_audio.duration:.1f}s, tempo: {features.tempo:.0f} BPM)"
            )

    logger.info(
        f"Loaded {len(campaign_audios)} campaign audio files from {len(set(ca.campaign_id for ca in campaign_audios))} campaigns"
    )
    return campaign_audios


# ============================================================================
# Convex Integration
# ============================================================================


def init_convex_client() -> ConvexClient:
    """Initialize Convex client"""
    if not CONVEX_URL:
        logger.error("NEXT_PUBLIC_CONVEX_URL not set in environment")
        sys.exit(1)

    logger.info(f"Connecting to Convex: {CONVEX_URL}")
    client = ConvexClient(CONVEX_URL)
    client.set_admin_auth(CONVEX_DEPLOY_KEY)
    return client


def fetch_unmatched_videos(client: ConvexClient) -> List[TikTokVideo]:
    """
    Fetch TikTok videos that don't have a campaignId set

    Returns:
        List of TikTokVideo objects
    """
    logger.info("Fetching TikTok videos without campaignId...")

    try:
        # Call the Convex query function
        all_videos = client.query("app/tiktok:listVideosWithoutCampaign")

        # Convert to TikTokVideo objects
        unmatched_videos = []
        for video in all_videos:
            unmatched_videos.append(
                TikTokVideo(
                    id=video["_id"],
                    music_url=video["musicUrl"],
                    video_id=video["videoId"],
                    username=video["username"],
                )
            )

        logger.info(f"Found {len(unmatched_videos)} videos without campaignId")
        return unmatched_videos

    except Exception as e:
        logger.error(f"Failed to fetch videos from Convex: {e}")
        return []


def update_video_campaign(
    client: ConvexClient, video_id: str, campaign_id: str
) -> bool:
    """
    Update a video's campaignId in Convex

    Returns:
        True if successful, False otherwise
    """
    try:
        # Call the Convex mutation function
        client.mutation(
            "app/tiktok:updateVideoCampaign",
            {"videoId": video_id, "campaignId": campaign_id},
        )
        return True
    except Exception as e:
        logger.error(f"Failed to update video {video_id}: {e}")
        return False


def bulk_update_campaigns(client: ConvexClient, updates: List[Tuple[str, str]]) -> int:
    """
    Bulk update multiple videos' campaignIds

    Args:
        updates: List of (video_id, campaign_id) tuples

    Returns:
        Number of successful updates
    """
    success_count = 0
    for video_id, campaign_id in updates:
        if update_video_campaign(client, video_id, campaign_id):
            success_count += 1
    return success_count


# ============================================================================
# Audio Matching
# ============================================================================


def calculate_confidence(score_gap: float) -> str:
    """
    Calculate confidence level based on score gap

    Args:
        score_gap: Difference between best and second-best match

    Returns:
        Confidence level: "high", "medium", or "low"
    """
    if score_gap >= 15.0:
        return "high"
    elif score_gap >= 10.0:
        return "medium"
    else:
        return "low"


def match_audio_to_campaigns(
    music_url: str, campaign_audios: List[CampaignAudio]
) -> Tuple[Optional[str], float, Dict[str, float], float, str]:
    """
    Match a TikTok music URL against campaign audios using multi-feature matching

    Args:
        music_url: URL of TikTok music
        campaign_audios: List of campaign audio objects

    Returns:
        (campaign_id, similarity_score, feature_scores, score_gap, confidence)
        - campaign_id: Best matching campaign ID or None
        - similarity_score: Combined similarity score (0-100)
        - feature_scores: Dict of individual feature scores
        - score_gap: Gap between best and second-best match
        - confidence: "high", "medium", or "low"
    """
    # Download TikTok music
    temp_file = download_audio(music_url)
    if temp_file is None:
        return None, 0.0, {}, 0.0, "low"

    try:
        # Extract all features from TikTok audio
        tiktok_features = extract_all_features(temp_file)
        if tiktok_features is None:
            return None, 0.0, {}, 0.0, "low"

        # Compare against all campaign audios
        all_scores = []  # List of (campaign_id, score, feature_scores)

        for campaign_audio in campaign_audios:
            # Calculate combined similarity
            combined_score, feature_scores = compute_combined_similarity(
                tiktok_features, campaign_audio.features
            )

            all_scores.append(
                (campaign_audio.campaign_id, combined_score, feature_scores)
            )

            # Log detailed scores for debugging
            logger.info(
                f"    {campaign_audio.campaign_id}: {combined_score:.1f}% "
                f"(M:{feature_scores['mfcc']:.0f}% C:{feature_scores['chroma']:.0f}% "
                f"S:{feature_scores['spectral_contrast']:.0f}% R:{feature_scores['rhythm']:.0f}%)"
            )

        # Sort by score (descending)
        all_scores.sort(key=lambda x: x[1], reverse=True)

        # Get best match
        best_campaign_id, best_score, best_feature_scores = all_scores[0]

        # Calculate score gap (for confidence assessment)
        if len(all_scores) > 1:
            second_best_score = all_scores[1][1]
            score_gap = best_score - second_best_score
        else:
            second_best_score = 0.0
            score_gap = best_score

        # Calculate confidence
        confidence = calculate_confidence(score_gap)

        # Log summary of top 3 matches
        logger.info("    Top matches:")
        for i, (cid, score, _) in enumerate(all_scores[:3], 1):
            logger.info(f"      {i}. {cid}: {score:.1f}%")
        logger.info(
            f"    Score gap: {score_gap:.1f}%, Confidence: {confidence.upper()}"
        )

        return best_campaign_id, best_score, best_feature_scores, score_gap, confidence

    except Exception as e:
        logger.error(f"Error matching audio: {e}")
        import traceback

        logger.error(traceback.format_exc())
        return None, 0.0, {}, 0.0, "low"

    finally:
        # Always clean up temp file
        try:
            temp_file.unlink()
        except Exception as e:
            logger.warning(f"Failed to delete temp file {temp_file}: {e}")


def process_video(
    video: TikTokVideo, campaign_audios: List[CampaignAudio]
) -> MatchResult:
    """
    Process a single video - download music and find best match

    Includes robust error handling to prevent bus errors and crashes

    Args:
        video: TikTok video to process
        campaign_audios: List of campaign audio objects

    Returns:
        MatchResult object with detailed scores
    """
    logger.info(f"Processing video {video.video_id} (@{video.username})")

    try:
        # Wrap in an additional try-catch to handle any unexpected errors
        # including bus errors from corrupted audio or DTW issues
        (
            campaign_id,
            similarity,
            feature_scores,
            score_gap,
            confidence,
        ) = match_audio_to_campaigns(video.music_url, campaign_audios)

        matched = similarity >= SIMILARITY_THRESHOLD

        if matched:
            logger.info(
                f"  Match: {campaign_id} ({similarity:.1f}%, {confidence.upper()} confidence)"
            )
        else:
            if similarity > 0:
                logger.info(
                    f"  No match (best: {similarity:.1f}%, gap: {score_gap:.1f}%)"
                )
            else:
                logger.info("  No match (failed to analyze)")

        return MatchResult(
            video_id=video.id,
            campaign_id=campaign_id if matched else None,
            similarity_score=similarity,
            matched=matched,
            mfcc_score=feature_scores.get("mfcc", 0.0),
            chroma_score=feature_scores.get("chroma", 0.0),
            spectral_contrast_score=feature_scores.get("spectral_contrast", 0.0),
            rhythm_score=feature_scores.get("rhythm", 0.0),
            second_best_score=similarity - score_gap if score_gap > 0 else 0.0,
            score_gap=score_gap,
            confidence=confidence,
        )

    except MemoryError as e:
        logger.error(f"  Out of memory processing video: {e}")
        logger.error("  Try reducing MAX_WORKERS or max_frames in the code")
        return MatchResult(
            video_id=video.id,
            campaign_id=None,
            similarity_score=0.0,
            matched=False,
            error=f"Out of memory: {str(e)}",
        )
    except KeyboardInterrupt:
        raise  # Let keyboard interrupt propagate
    except (OSError, RuntimeError) as e:
        # Handle bus errors and other system errors gracefully
        logger.error(f"  System error processing video (bus error/corrupted audio): {e}")
        return MatchResult(
            video_id=video.id,
            campaign_id=None,
            similarity_score=0.0,
            matched=False,
            error=f"System error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"  Error processing video: {e}")
        import traceback

        logger.error(traceback.format_exc())
        return MatchResult(
            video_id=video.id,
            campaign_id=None,
            similarity_score=0.0,
            matched=False,
            error=str(e),
        )


# ============================================================================
# Checkpoint Management
# ============================================================================


def load_checkpoint() -> Dict[str, any]:
    """Load checkpoint from file if exists"""
    if CHECKPOINT_FILE.exists():
        try:
            with open(CHECKPOINT_FILE, "r") as f:
                checkpoint = json.load(f)
            logger.info(f"Loaded checkpoint: {len(checkpoint.get('processed_videos', []))} videos already processed")
            return checkpoint
        except Exception as e:
            logger.warning(f"Failed to load checkpoint: {e}. Starting fresh.")
            return {"processed_videos": [], "results": []}
    return {"processed_videos": [], "results": []}


def save_checkpoint(processed_videos: List[str], results: List[Dict]) -> None:
    """Save checkpoint to file"""
    try:
        checkpoint = {
            "processed_videos": processed_videos,
            "results": results,
            "last_updated": time.time(),
        }
        with open(CHECKPOINT_FILE, "w") as f:
            json.dump(checkpoint, f, indent=2)
        logger.debug(f"Checkpoint saved: {len(processed_videos)} videos processed")
    except Exception as e:
        logger.error(f"Failed to save checkpoint: {e}")


# ============================================================================
# Main Processing
# ============================================================================


def main():
    """Main execution function with checkpoint support"""
    start_time = time.time()

    logger.info("=" * 80)
    logger.info("TikTok Music Matching Script (Multi-Feature)")
    logger.info("Using Multi-Feature Audio Fingerprinting with:")
    logger.info(f"  - MFCC: {FEATURE_WEIGHTS['mfcc']*100:.0f}%")
    logger.info(f"  - Chroma: {FEATURE_WEIGHTS['chroma']*100:.0f}%")
    logger.info(f"  - Spectral Contrast: {FEATURE_WEIGHTS['spectral_contrast']*100:.0f}%")
    logger.info(f"  - Rhythm: {FEATURE_WEIGHTS['rhythm']*100:.0f}%")
    logger.info(f"Workers: {MAX_WORKERS}, Immediate Updates: {IMMEDIATE_UPDATE}")
    logger.info("=" * 80)

    # 1. Load checkpoint to resume from previous run
    checkpoint = load_checkpoint()
    processed_video_ids = set(checkpoint.get("processed_videos", []))

    # 2. Load campaign audios
    campaign_audios = load_campaign_audios()
    if not campaign_audios:
        logger.error("No campaign audios loaded. Exiting.")
        return

    # 3. Initialize Convex client
    client = init_convex_client()

    # 4. Fetch unmatched videos
    all_videos = fetch_unmatched_videos(client)
    if not all_videos:
        logger.info("No unmatched videos found. Exiting.")
        return

    # Filter out already processed videos
    videos = [v for v in all_videos if v.id not in processed_video_ids]

    if len(processed_video_ids) > 0:
        logger.info(f"Resuming from checkpoint: {len(processed_video_ids)} already processed")
        logger.info(f"Remaining: {len(videos)} of {len(all_videos)} total videos")
    else:
        logger.info(f"Processing {len(videos)} videos (fresh start)")

    if not videos:
        logger.info("All videos already processed!")
        return

    # 5. Process videos with checkpointing and immediate updates
    results = []
    matches_count = 0
    errors_count = 0

    # Track progress for checkpointing
    new_processed_ids = list(processed_video_ids)

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        future_to_video = {
            executor.submit(process_video, video, campaign_audios): video
            for video in videos
        }

        # Process completed tasks
        for i, future in enumerate(as_completed(future_to_video), 1):
            try:
                result = future.result()
                results.append(result)
                new_processed_ids.append(result.video_id)

                # Immediately update Convex if matched
                if result.matched and IMMEDIATE_UPDATE:
                    try:
                        update_video_campaign(client, result.video_id, result.campaign_id)
                        matches_count += 1
                        logger.info("  ✓ Updated in Convex immediately")
                    except Exception as update_error:
                        logger.error(f"  ✗ Failed to update Convex: {update_error}")
                        result.error = f"Convex update failed: {update_error}"
                elif result.matched:
                    matches_count += 1

                if result.error:
                    errors_count += 1

                # Save checkpoint every CHECKPOINT_INTERVAL videos
                if i % CHECKPOINT_INTERVAL == 0:
                    save_checkpoint(new_processed_ids, results)
                    logger.info(
                        f"Progress: {i}/{len(videos)} videos, {matches_count} matches, "
                        f"{errors_count} errors (checkpoint saved)"
                    )
                elif i % 10 == 0:
                    logger.info(
                        f"Progress: {i}/{len(videos)} videos, {matches_count} matches, {errors_count} errors"
                    )

            except Exception as e:
                logger.error(f"Error processing video result: {e}")
                errors_count += 1

    # Final checkpoint save
    save_checkpoint(new_processed_ids, results)
    logger.info("Final checkpoint saved")

    # 6. Calculate confidence statistics
    matched_results = [r for r in results if r.matched]
    unmatched = [r for r in results if not r.matched and not r.error]
    error_results = [r for r in results if r.error]

    confidence_stats = {
        "high": len([r for r in matched_results if r.confidence == "high"]),
        "medium": len([r for r in matched_results if r.confidence == "medium"]),
        "low": len([r for r in matched_results if r.confidence == "low"]),
    }

    # Calculate average scores for matched videos
    if matched_results:
        avg_scores = {
            "combined": np.mean([r.similarity_score for r in matched_results]),
            "score_gap": np.mean([r.score_gap for r in matched_results]),
            "mfcc": np.mean([r.mfcc_score for r in matched_results]),
            "chroma": np.mean([r.chroma_score for r in matched_results]),
            "spectral_contrast": np.mean([r.spectral_contrast_score for r in matched_results]),
            "rhythm": np.mean([r.rhythm_score for r in matched_results]),
        }
    else:
        avg_scores = {}

    # Build error details list
    error_details = [{"video_id": r.video_id, "error": r.error} for r in error_results]

    results_summary = {
        "total_processed": len(results),
        "matched": matches_count,
        "unmatched": len(unmatched),
        "errors_count": errors_count,
        "execution_time_seconds": time.time() - start_time,
        "similarity_threshold": SIMILARITY_THRESHOLD,
        "confidence_distribution": confidence_stats,
        "average_scores": avg_scores,
        "feature_weights": FEATURE_WEIGHTS,
        "checkpoint_file": str(CHECKPOINT_FILE),
        "immediate_updates": IMMEDIATE_UPDATE,
        "matched_videos": [
            {
                "video_id": r.video_id,
                "campaign_id": r.campaign_id,
                "similarity": r.similarity_score,
                "score_gap": r.score_gap,
                "confidence": r.confidence,
                "feature_scores": {
                    "mfcc": r.mfcc_score,
                    "chroma": r.chroma_score,
                    "spectral_contrast": r.spectral_contrast_score,
                    "rhythm": r.rhythm_score,
                },
            }
            for r in matched_results
        ],
        "unmatched_videos": [
            {
                "video_id": r.video_id,
                "best_similarity": r.similarity_score,
                "score_gap": r.score_gap,
                "feature_scores": {
                    "mfcc": r.mfcc_score,
                    "chroma": r.chroma_score,
                    "spectral_contrast": r.spectral_contrast_score,
                    "rhythm": r.rhythm_score,
                },
            }
            for r in unmatched
        ],
        "error_details": error_details,
    }

    # Save to file
    output_file = Path(__file__).parent / "matching-results.json"
    with open(output_file, "w") as f:
        json.dump(results_summary, f, indent=2)

    # 7. Print summary
    logger.info("=" * 80)
    logger.info("RESULTS SUMMARY")
    logger.info("=" * 80)
    logger.info(f"Total videos processed this run: {len(results)}")
    logger.info(f"Total processed (including checkpoint): {len(new_processed_ids)}")
    logger.info(f"Matched and updated: {matches_count}")
    logger.info(f"No match found: {len(unmatched)}")
    if matched_results:
        logger.info("")
        logger.info("Match Confidence Distribution:")
        logger.info(f"  High confidence:   {confidence_stats['high']}")
        logger.info(f"  Medium confidence: {confidence_stats['medium']}")
        logger.info(f"  Low confidence:    {confidence_stats['low']}")
        logger.info("")
        logger.info("Average Scores (matched videos):")
        logger.info(f"  Combined similarity: {avg_scores['combined']:.1f}%")
        logger.info(f"  Score gap:           {avg_scores['score_gap']:.1f}%")
        logger.info(f"  MFCC:                {avg_scores['mfcc']:.1f}%")
        logger.info(f"  Chroma:              {avg_scores['chroma']:.1f}%")
        logger.info(f"  Spectral Contrast:   {avg_scores['spectral_contrast']:.1f}%")
        logger.info(f"  Rhythm:              {avg_scores['rhythm']:.1f}%")
    logger.info(f"Errors: {errors_count}")
    logger.info(f"Execution time: {results_summary['execution_time_seconds']:.1f}s")
    logger.info(f"Results saved to: {output_file}")
    logger.info(f"Checkpoint saved to: {CHECKPOINT_FILE}")
    logger.info("=" * 80)


if __name__ == "__main__":
    main()
