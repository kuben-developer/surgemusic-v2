import type { ClipperClip } from "../../shared/types/common.types";

/**
 * Extract the original video name from a clip filename
 * Pattern: [video-name]_clip_[number]_...
 * Example: "myvideo_clip_0001_..." returns "myvideo"
 */
export function extractVideoName(filename: string): string {
  const match = filename.match(/^(.+?)_clip_\d+/);
  if (match && match[1]) {
    return match[1];
  }
  // Fallback: return full filename if pattern doesn't match
  return filename;
}

/**
 * Group clips by their original video name
 * Returns a map of video names to arrays of clips
 */
export function groupClipsByVideo(clips: ClipperClip[]): Map<string, ClipperClip[]> {
  const groups = new Map<string, ClipperClip[]>();

  for (const clip of clips) {
    const videoName = extractVideoName(clip.filename);
    const existing = groups.get(videoName) || [];
    groups.set(videoName, [...existing, clip]);
  }

  return groups;
}

/**
 * Get sorted video names from grouped clips
 * Sorted alphabetically for consistent display
 */
export function getSortedVideoNames(groups: Map<string, ClipperClip[]>): string[] {
  return Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));
}
