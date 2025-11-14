import type { WordData } from "@/features/campaign/media/types/media.types";

/**
 * Parse SRT timestamp to seconds
 * Format: HH:MM:SS,mmm
 * @param timestamp - SRT timestamp string
 * @returns Time in seconds (with decimal for milliseconds)
 */
function parseSRTTimestamp(timestamp: string): number {
  const [time, milliseconds] = timestamp.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
}

/**
 * Parse word-level SRT content to extract WordData array
 * @param srtContent - SRT file content as string
 * @returns Array of WordData with timing information
 */
export function parseWordLevelDataFromSRT(srtContent: string): WordData[] {
  const wordsData: WordData[] = [];

  // Split into blocks (separated by double newlines)
  const blocks = srtContent
    .trim()
    .split(/\n\s*\n/)
    .filter((block) => block.trim().length > 0);

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim());

    // Skip if not enough lines
    if (lines.length < 3) continue;

    // Line 0: sequence number (we can skip this)
    // Line 1: timestamp line (start --> end)
    // Line 2+: text content (could be multi-line)

    const timestampLine = lines[1];
    const textLines = lines.slice(2);

    // Parse timestamps
    const timestampMatch = timestampLine.match(/(\S+)\s+-->\s+(\S+)/);
    if (!timestampMatch) continue;

    const startTime = parseSRTTimestamp(timestampMatch[1]);
    const endTime = parseSRTTimestamp(timestampMatch[2]);

    // Join all text lines (in case of multi-line subtitles)
    const text = textLines.join(" ").trim();

    wordsData.push({
      text,
      start: startTime,
      end: endTime,
      type: "word", // Default type for parsed words
    });
  }

  return wordsData;
}

/**
 * Parse SRT content into simple lyric lines (second-level)
 * This is used for backward compatibility with the existing parseSRT function
 * @param srtContent - SRT file content as string
 * @returns Array of objects with timestamp and text
 */
export function parseSRTToLyrics(srtContent: string): Array<{ timestamp: number; text: string }> {
  const lyrics: Array<{ timestamp: number; text: string }> = [];

  // Split into blocks (separated by double newlines)
  const blocks = srtContent
    .trim()
    .split(/\n\s*\n/)
    .filter((block) => block.trim().length > 0);

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim());

    if (lines.length < 3) continue;

    const timestampLine = lines[1];
    const textLines = lines.slice(2);

    // Parse start timestamp
    const timestampMatch = timestampLine.match(/(\S+)\s+-->\s+(\S+)/);
    if (!timestampMatch) continue;

    const timestamp = parseSRTTimestamp(timestampMatch[1]);
    const text = textLines.join(" ").trim();

    lyrics.push({ timestamp, text });
  }

  return lyrics;
}
