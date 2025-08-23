import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Initialize FFmpeg instance for audio processing
 */
async function initFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpegLoaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  // Load FFmpeg with CORS-enabled CDN URLs
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpegLoaded = true;
  return ffmpeg;
}

/**
 * Trim audio file to exactly 15 seconds from the specified start time
 * @param audioFile - The audio file to trim
 * @param startTime - Start time in seconds
 * @returns The trimmed audio file (15 seconds long)
 */
export async function trimAudioTo15Seconds(
  audioFile: File,
  startTime: number
): Promise<File> {
  try {
    const ffmpegInstance = await initFFmpeg();

    // Generate unique file names
    const inputFileName = `input_${Date.now()}.${audioFile.name.split('.').pop()}`;
    const outputFileName = `trimmed_${Date.now()}.mp3`;

    // Write the audio file to FFmpeg's virtual file system
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(audioFile));

    // Execute FFmpeg command to trim audio to exactly 15 seconds
    // -ss: start time
    // -t: duration (15 seconds)
    // -acodec mp3: use MP3 audio codec
    // -ab 128k: audio bitrate
    // -ar 44100: audio sample rate
    await ffmpegInstance.exec([
      "-i", inputFileName,
      "-ss", startTime.toString(),
      "-t", "15",
      "-acodec", "mp3",
      "-ab", "128k",
      "-ar", "44100",
      outputFileName
    ]);

    // Read the output file
    const outputData = await ffmpegInstance.readFile(outputFileName);
    
    // Clean up virtual file system
    await ffmpegInstance.deleteFile(inputFileName);
    await ffmpegInstance.deleteFile(outputFileName);

    // Create a new File object with the trimmed audio
    let audioBlob: Blob;
    if (outputData instanceof Uint8Array) {
      const buffer = new ArrayBuffer(outputData.length);
      new Uint8Array(buffer).set(outputData);
      audioBlob = new Blob([buffer], { type: "audio/mpeg" });
    } else if (typeof outputData === 'string') {
      audioBlob = new Blob([outputData], { type: "audio/mpeg" });
    } else {
      audioBlob = new Blob([outputData as ArrayBuffer], { type: "audio/mpeg" });
    }

    const trimmedFile = new File(
      [audioBlob],
      `trimmed_${audioFile.name.replace(/\.[^/.]+$/, ".mp3")}`,
      { type: "audio/mpeg" }
    );

    return trimmedFile;
  } catch (error) {
    console.error("Audio trimming failed:", error);
    throw new Error("Failed to trim audio to 15 seconds");
  }
}

/**
 * Get audio duration in seconds
 * @param audioFile - The audio file or blob
 * @returns Duration in seconds
 */
export async function getAudioDuration(audioFile: File | Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(audioFile);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio file'));
    });

    audio.src = url;
  });
}

/**
 * Generate waveform data from audio file for visualization
 * @param audioFile - The audio file
 * @param samples - Number of samples to generate (default 200)
 * @returns Array of normalized amplitude values between 0 and 1
 */
export async function generateWaveformData(
  audioFile: File | Blob,
  samples: number = 200
): Promise<number[]> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0); // Get first channel
    const samplesPerBar = Math.floor(channelData.length / samples);
    const waveformData: number[] = [];

    for (let i = 0; i < samples; i++) {
      const start = i * samplesPerBar;
      const end = Math.min(start + samplesPerBar, channelData.length);
      
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }
      
      const average = sum / (end - start);
      waveformData.push(average);
    }

    // Normalize the data to 0-1 range
    const max = Math.max(...waveformData);
    if (max === 0) return waveformData; // Avoid division by zero
    return waveformData.map(value => value / max);
  } catch (error) {
    console.error("Failed to generate waveform data:", error);
    // Return a default flat waveform if generation fails
    return Array(samples).fill(0.5);
  }
}

/**
 * Validate that the trimmed selection is valid
 * @param startTime - Start time in seconds
 * @param audioDuration - Total audio duration in seconds
 * @returns Whether the selection is valid (15 seconds from start doesn't exceed duration)
 */
export function isValidTrimSelection(startTime: number, audioDuration: number): boolean {
  return startTime >= 0 && (startTime + 15) <= audioDuration;
}

/**
 * Format time in seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}