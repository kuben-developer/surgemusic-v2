/**
 * Client-side URL parsing utilities for TikTok URLs
 * Mirrors the server-side utils for consistency
 */

/**
 * Parse a TikTok video URL and extract the video ID
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
 */
export function parseProfileUrl(url: string): { username: string } | null {
  const trimmedUrl = url.trim();

  // Handle direct @username format
  if (trimmedUrl.startsWith("@") && !trimmedUrl.includes("/")) {
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
 * Parse raw text input into an array of URLs
 * Splits by newlines and filters empty lines
 */
export function parseRawInput(rawText: string): string[] {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Validate a list of URLs for a specific type
 */
export function validateUrls(
  urls: string[],
  type: "videos" | "profiles"
): {
  valid: string[];
  invalid: Array<{ url: string; reason: string }>;
} {
  const valid: string[] = [];
  const invalid: Array<{ url: string; reason: string }> = [];

  for (const url of urls) {
    if (type === "videos") {
      const parsed = parseVideoUrl(url);
      if (parsed) {
        valid.push(url);
      } else {
        invalid.push({
          url,
          reason: "Invalid video URL format",
        });
      }
    } else {
      const parsed = parseProfileUrl(url);
      if (parsed) {
        valid.push(url);
      } else {
        invalid.push({
          url,
          reason: "Invalid profile URL format",
        });
      }
    }
  }

  return { valid, invalid };
}

/**
 * Count valid URLs in raw text input
 */
export function countValidUrls(
  rawText: string,
  type: "videos" | "profiles"
): { total: number; valid: number; invalid: number } {
  const urls = parseRawInput(rawText);
  const { valid, invalid } = validateUrls(urls, type);

  return {
    total: urls.length,
    valid: valid.length,
    invalid: invalid.length,
  };
}

/**
 * Get date filter timestamp based on option
 */
export function getDateFilterTimestamp(
  option: "all" | "last_week" | "last_month" | "last_3_months" | "last_6_months" | "last_year" | "custom",
  customDate?: Date
): number | undefined {
  const now = Date.now();

  switch (option) {
    case "all":
      return undefined;
    case "last_week":
      return Math.floor((now - 7 * 24 * 60 * 60 * 1000) / 1000);
    case "last_month":
      return Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000);
    case "last_3_months":
      return Math.floor((now - 90 * 24 * 60 * 60 * 1000) / 1000);
    case "last_6_months":
      return Math.floor((now - 180 * 24 * 60 * 60 * 1000) / 1000);
    case "last_year":
      return Math.floor((now - 365 * 24 * 60 * 60 * 1000) / 1000);
    case "custom":
      return customDate ? Math.floor(customDate.getTime() / 1000) : undefined;
    default:
      return undefined;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
