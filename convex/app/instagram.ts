// =============================================================================
// RocketAPI client for Instagram media stats
// =============================================================================

const ROCKETAPI_API_KEY = process.env.ROCKETAPI_API_KEY || "";

export interface InstagramMediaDetails {
  shortcode: string;
  instagramUserId: string;
  instagramUsername: string;
  mediaType: number; // 1=photo, 2=video, 8=carousel
  postedAt: number; // taken_at unix timestamp
  views: number; // play_count (0 for non-video)
  likes: number; // like_count
  comments: number; // comment_count
  thumbnailUrl: string; // image_versions2.candidates[0].url
}

/**
 * Fetch Instagram media details by shortcode via RocketAPI.
 */
export async function fetchInstagramMediaByShortcode(
  shortcode: string,
): Promise<InstagramMediaDetails | null> {
  try {
    const response = await fetch(
      "https://v1.rocketapi.io/instagram/media/get_info_by_shortcode",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${ROCKETAPI_API_KEY}`,
        },
        body: JSON.stringify({ shortcode }),
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!response.ok) {
      console.error(
        `RocketAPI: Failed to fetch shortcode ${shortcode}: HTTP ${response.status}`,
      );
      return null;
    }

    const data = await response.json();

    const items = data?.response?.body?.items;
    if (!items || items.length === 0) {
      console.error(`RocketAPI: No items for shortcode ${shortcode}`);
      return null;
    }

    const item = items[0];
    const user = item.user;

    if (!user) {
      console.error(`RocketAPI: No user data for shortcode ${shortcode}`);
      return null;
    }

    // Extract thumbnail from image_versions2.candidates[0].url
    const thumbnailUrl =
      item.image_versions2?.candidates?.[0]?.url || "";

    return {
      shortcode: item.code || shortcode,
      instagramUserId: String(user.pk || user.id || ""),
      instagramUsername: user.username || "",
      mediaType: item.media_type || 1,
      postedAt: item.taken_at || 0,
      views: item.play_count || 0,
      likes: item.like_count || 0,
      comments: item.comment_count || 0,
      thumbnailUrl,
    };
  } catch (error) {
    console.error(`RocketAPI: Error fetching shortcode ${shortcode}:`, error);
    return null;
  }
}
