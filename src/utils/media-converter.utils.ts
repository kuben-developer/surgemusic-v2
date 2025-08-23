import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Initialize FFmpeg instance for video/audio conversion
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
 * Convert a video file to audio (MP3 format)
 * @param videoFile - The video file to convert
 * @returns The converted audio file
 */
export async function convertVideoToAudio(videoFile: File): Promise<File> {
  try {
    // Initialize FFmpeg if not already loaded
    const ffmpegInstance = await initFFmpeg();

    // Generate unique file names
    const inputFileName = `input_${Date.now()}.${videoFile.name.split('.').pop()}`;
    const outputFileName = `output_${Date.now()}.mp3`;

    // Write the video file to FFmpeg's virtual file system
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(videoFile));

    // Execute FFmpeg command to extract audio
    // -i: input file
    // -vn: disable video
    // -acodec mp3: use MP3 audio codec
    // -ab 128k: audio bitrate
    // -ar 44100: audio sample rate
    await ffmpegInstance.exec([
      "-i", inputFileName,
      "-vn",
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

    // Create a new File object with the converted audio
    // Handle different possible return types from FFmpeg
    let audioBlob: Blob;
    if (outputData instanceof Uint8Array) {
      // Convert Uint8Array to ArrayBuffer to avoid SharedArrayBuffer issues
      const buffer = new ArrayBuffer(outputData.length);
      new Uint8Array(buffer).set(outputData);
      audioBlob = new Blob([buffer], { type: "audio/mpeg" });
    } else if (typeof outputData === 'string') {
      // Handle string data (base64 or similar)
      audioBlob = new Blob([outputData], { type: "audio/mpeg" });
    } else {
      // Handle ArrayBuffer directly
      audioBlob = new Blob([outputData as ArrayBuffer], { type: "audio/mpeg" });
    }
    const audioFile = new File(
      [audioBlob], 
      videoFile.name.replace(/\.[^/.]+$/, ".mp3"), // Replace extension with .mp3
      { type: "audio/mpeg" }
    );

    return audioFile;
  } catch (error) {
    console.error("Video to audio conversion failed:", error);
    throw new Error("Failed to convert video to audio");
  }
}

/**
 * Check if a file is a video that needs conversion to audio
 * @param file - The file to check
 * @param targetType - The target file type
 * @returns Whether conversion is needed
 */
export function needsVideoToAudioConversion(file: File, targetType?: string): boolean {
  return targetType === "audio" && file.type.startsWith("video/");
}

/**
 * Get the MIME type for a file based on its extension
 * @param fileName - The file name
 * @returns The MIME type
 */
export function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    // Video
    mp4: "video/mp4",
    webm: "video/webm",
    ogv: "video/ogg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    // Audio/Video ambiguous
    ogg: "audio/ogg", // Default to audio for .ogg
  };

  return mimeTypes[extension ?? ""] ?? "application/octet-stream";
}