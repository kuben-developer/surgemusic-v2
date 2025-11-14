import type { WordData } from "@/features/campaign/media/types/media.types";

/**
 * Convert seconds to SRT timestamp format (HH:MM:SS,mmm)
 * @param seconds - Time in seconds (can have decimals)
 * @returns Formatted timestamp string
 */
function formatSRTTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

/**
 * Generate word-level SRT content from word timing data
 * @param wordsData - Array of word timing data from ElevenLabs transcription
 * @returns SRT formatted string with word-level timestamps
 */
export function generateWordLevelSRT(wordsData: WordData[]): string {
  const srtLines: string[] = [];

  wordsData.forEach((word, index) => {
    const sequenceNumber = index + 1;
    const startTime = formatSRTTimestamp(word.start);
    const endTime = formatSRTTimestamp(word.end);
    const text = word.text;

    // SRT format:
    // sequence number
    // start --> end
    // text
    // blank line
    srtLines.push(`${sequenceNumber}`);
    srtLines.push(`${startTime} --> ${endTime}`);
    srtLines.push(text);
    srtLines.push(""); // blank line separator
  });

  return srtLines.join("\n");
}

/**
 * Generate estimated SRT content from lyrics without timing data
 * Creates a simple SRT with 1 second per word as fallback
 * @param lyrics - Plain text lyrics (words separated by spaces)
 * @returns SRT formatted string with estimated timestamps
 */
export function generateEstimatedSRT(lyrics: string): string {
  // Split lyrics into individual words
  const words = lyrics.split(/\s+/).filter((word) => word.length > 0);

  const srtLines: string[] = [];
  const DURATION_PER_WORD = 0.5; // 0.5 seconds per word

  words.forEach((word, index) => {
    const sequenceNumber = index + 1;
    const startTime = index * DURATION_PER_WORD;
    const endTime = startTime + DURATION_PER_WORD;

    const startTimestamp = formatSRTTimestamp(startTime);
    const endTimestamp = formatSRTTimestamp(endTime);

    srtLines.push(`${sequenceNumber}`);
    srtLines.push(`${startTimestamp} --> ${endTimestamp}`);
    srtLines.push(word);
    srtLines.push(""); // blank line separator
  });

  return srtLines.join("\n");
}

/**
 * Convert SRT content string to a File object for upload
 * @param srtContent - The SRT content as a string
 * @param filename - The desired filename (e.g., 'campaign-123.srt')
 * @returns File object ready for upload
 */
export function convertSRTToFile(srtContent: string, filename: string): File {
  const blob = new Blob([srtContent], { type: "text/plain" });
  return new File([blob], filename, { type: "text/plain" });
}
