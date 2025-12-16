/**
 * URL parsing utilities for TikTok video and profile URLs
 */

/**
 * Parse a TikTok video URL and extract the video ID
 * Supports formats:
 * - https://www.tiktok.com/@username/video/VIDEO_ID
 * - https://www.tiktok.com/@username/video/VIDEO_ID/
 * - https://tiktok.com/@username/video/VIDEO_ID
 */
export function parseVideoUrl(url: string): { videoId: string } | null {
  const trimmedUrl = url.trim();

  // Match pattern: tiktok.com/@username/video/VIDEO_ID
  const videoRegex = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/i;
  const match = trimmedUrl.match(videoRegex);

  if (match && match[1]) {
    return { videoId: match[1] };
  }

  return null;
}

/**
 * Parse a TikTok profile URL and extract the username
 * Supports formats:
 * - https://www.tiktok.com/@username
 * - https://www.tiktok.com/@username/
 * - https://tiktok.com/@username
 * - @username (just the handle)
 */
export function parseProfileUrl(url: string): { username: string } | null {
  const trimmedUrl = url.trim();

  // Handle direct @username format
  if (trimmedUrl.startsWith('@') && !trimmedUrl.includes('/')) {
    const username = trimmedUrl.substring(1);
    if (username.length > 0 && /^[\w.-]+$/.test(username)) {
      return { username };
    }
    return null;
  }

  // Match pattern: tiktok.com/@username (profile URL, not video URL)
  const profileRegex = /tiktok\.com\/@([\w.-]+)\/?$/i;
  const match = trimmedUrl.match(profileRegex);

  if (match && match[1]) {
    return { username: match[1] };
  }

  return null;
}

/**
 * Parse a list of URLs and extract video IDs or usernames
 * Returns both valid parsed results and invalid URLs with reasons
 */
export function parseUrlList(
  urls: string[],
  type: "videos" | "profiles"
): {
  valid: Array<{ url: string; parsed: { videoId: string } | { username: string } }>;
  invalid: Array<{ url: string; reason: string }>;
} {
  const valid: Array<{ url: string; parsed: { videoId: string } | { username: string } }> = [];
  const invalid: Array<{ url: string; reason: string }> = [];

  for (const url of urls) {
    const trimmedUrl = url.trim();

    // Skip empty lines
    if (!trimmedUrl) {
      continue;
    }

    if (type === "videos") {
      const parsed = parseVideoUrl(trimmedUrl);
      if (parsed) {
        valid.push({ url: trimmedUrl, parsed });
      } else {
        invalid.push({
          url: trimmedUrl,
          reason: "Invalid TikTok video URL format. Expected: https://www.tiktok.com/@username/video/VIDEO_ID",
        });
      }
    } else {
      const parsed = parseProfileUrl(trimmedUrl);
      if (parsed) {
        valid.push({ url: trimmedUrl, parsed });
      } else {
        invalid.push({
          url: trimmedUrl,
          reason: "Invalid TikTok profile URL format. Expected: https://www.tiktok.com/@username or @username",
        });
      }
    }
  }

  return { valid, invalid };
}

/**
 * Check if a URL is a valid TikTok video URL
 */
export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null;
}

/**
 * Check if a URL is a valid TikTok profile URL
 */
export function isValidProfileUrl(url: string): boolean {
  return parseProfileUrl(url) !== null;
}

/**
 * Extract unique video IDs from a list of video URLs
 */
export function extractUniqueVideoIds(urls: string[]): string[] {
  const videoIds = new Set<string>();

  for (const url of urls) {
    const parsed = parseVideoUrl(url);
    if (parsed) {
      videoIds.add(parsed.videoId);
    }
  }

  return Array.from(videoIds);
}

/**
 * Extract unique usernames from a list of profile URLs
 */
export function extractUniqueUsernames(urls: string[]): string[] {
  const usernames = new Set<string>();

  for (const url of urls) {
    const parsed = parseProfileUrl(url);
    if (parsed) {
      usernames.add(parsed.username.toLowerCase());
    }
  }

  return Array.from(usernames);
}
