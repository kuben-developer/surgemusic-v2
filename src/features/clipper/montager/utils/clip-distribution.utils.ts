import type { ClipperClip, MontageData } from "../../shared/types/common.types";

const CLIPS_PER_MONTAGE = 14;

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp!;
  }
  return shuffled;
}

/**
 * Generate unique montage names
 */
function generateMontageName(index: number, timestamp: number): string {
  return `montage_${timestamp}_${String(index + 1).padStart(3, '0')}`;
}

/**
 * Distribute clips randomly across multiple montages with reuse allowed
 *
 * Each montage gets 14 randomly selected clips from the available pool.
 * Clips can be reused across different montages, allowing true random selection.
 *
 * @param allClips - Array of all clips from selected folders
 * @param numberOfMontages - Number of montages to create
 * @returns Array of montage configurations
 */
export function distributeClipsToMontages(
  allClips: ClipperClip[],
  numberOfMontages: number
): MontageData[] {
  // Check if we have at least one clip
  if (allClips.length === 0) {
    throw new Error(
      "No clips available. Please select folders with at least one clip."
    );
  }

  const montages: MontageData[] = [];
  const timestamp = Date.now();

  // For each montage, randomly select CLIPS_PER_MONTAGE clips (with reuse)
  for (let i = 0; i < numberOfMontages; i++) {
    const montageClips: string[] = [];

    // For each of the 14 positions, randomly select ANY clip from the pool
    for (let j = 0; j < CLIPS_PER_MONTAGE; j++) {
      const randomIndex = Math.floor(Math.random() * allClips.length);
      const randomClip = allClips[randomIndex]!;
      montageClips.push(randomClip.key);
    }

    montages.push({
      montage_name: generateMontageName(i, timestamp),
      clips: montageClips,
    });
  }

  return montages;
}

/**
 * Calculate how many montages can be created from available clips
 * With clip reuse enabled, there's no hard limit - return a practical maximum
 */
export function calculateMaxMontages(clipCount: number): number {
  // With reuse, you only need at least 1 clip to create montages
  // Return Infinity if clips exist, 0 otherwise
  return clipCount > 0 ? Infinity : 0;
}

/**
 * Validate montage creation request
 * With clip reuse enabled, you only need at least 1 clip
 */
export function validateMontageRequest(
  clipCount: number,
  requestedMontages: number
): { valid: boolean; error?: string } {
  if (requestedMontages <= 0) {
    return { valid: false, error: "Number of montages must be greater than 0" };
  }

  if (clipCount === 0) {
    return {
      valid: false,
      error: "No clips available. Please select folders with at least one clip.",
    };
  }

  // With clip reuse, there's no hard limit on number of montages
  return { valid: true };
}
