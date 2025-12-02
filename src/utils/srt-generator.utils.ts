import type { WordData, LyricLine } from "@/features/campaign/media/types/media.types";

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

/**
 * Generate SRT content from timed lyrics array
 * Each lyric line has a timestamp (0-14 seconds) and text
 * Words within each second are distributed evenly for smooth subtitle display
 * @param lyrics - Array of lyric lines with timestamp and text
 * @returns SRT formatted string with per-word timestamps
 */
export function generateSRTFromTimedLyrics(lyrics: LyricLine[]): string {
  const srtLines: string[] = [];
  let sequenceNumber = 1;

  for (const line of lyrics) {
    if (!line.text.trim()) continue; // Skip empty lines

    const words = line.text.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) continue;

    const secondStart = line.timestamp;
    const durationPerWord = 1 / words.length; // Distribute within 1 second

    words.forEach((word, wordIndex) => {
      const startTime = secondStart + wordIndex * durationPerWord;
      const endTime = startTime + durationPerWord;

      srtLines.push(`${sequenceNumber}`);
      srtLines.push(
        `${formatSRTTimestamp(startTime)} --> ${formatSRTTimestamp(endTime)}`
      );
      srtLines.push(word);
      srtLines.push(""); // blank line separator
      sequenceNumber++;
    });
  }

  return srtLines.join("\n");
}
