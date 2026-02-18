import { v } from "convex/values";
import { internalAction } from "../_generated/server";

const TOKAPI_KEY = "808a45b29cf9422798bcc4560909b4c2";
const TOKAPI_BASE_URL = "http://api.tokapi.online";

// =============================================================================
// SHARED TYPES & UTILITY
// =============================================================================

export interface TokapiVideoDetails {
  videoId: string;
  authorUid: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  createTime: number;
}

/**
 * Fetch video details from TOKAPI by TikTok video ID.
 * Shared utility used by both getTikTokVideoById action and analyticsV2 populate.
 */
export async function fetchVideoDetails(
  videoId: string,
): Promise<TokapiVideoDetails | null> {
  try {
    const response = await fetch(
      `${TOKAPI_BASE_URL}/v1/post/${videoId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-project-name": "tokapi",
          "x-api-key": TOKAPI_KEY,
        },
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!response.ok) {
      console.error(
        `Tokapi: Failed to fetch video ${videoId}: HTTP ${response.status}`,
      );
      return null;
    }

    const data = await response.json();

    if (data.status_code !== 0 || !data.aweme_detail) {
      return null;
    }

    const aweme = data.aweme_detail;
    const stats = aweme.statistics;
    const author = aweme.author;

    if (!stats || !author) {
      return null;
    }

    return {
      videoId,
      authorUid: String(author.uid || author.id || ""),
      views: stats.play_count || 0,
      likes: stats.digg_count || 0,
      comments: stats.comment_count || 0,
      shares: stats.share_count || 0,
      saves: stats.collect_count || 0,
      createTime: aweme.create_time || 0,
    };
  } catch (error) {
    console.error(`Tokapi: Error fetching video ${videoId}:`, error);
    return null;
  }
}

// =============================================================================
// CONVEX ACTION
// =============================================================================

/**
 * Fetches TikTok video stats by video ID using TOKAPI service.
 * Wraps the shared fetchVideoDetails utility as an internalAction.
 */
export const getTikTokVideoById = internalAction({
  args: {
    videoId: v.union(v.string(), v.number()),
  },
  handler: async (_, args): Promise<{
    success: boolean;
    video?: {
      videoId: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    };
    error?: string;
  }> => {
    const videoId = String(args.videoId);
    const details = await fetchVideoDetails(videoId);

    if (!details) {
      return {
        success: false,
        error: "Failed to fetch video details",
      };
    }

    return {
      success: true,
      video: {
        videoId: details.videoId,
        views: details.views,
        likes: details.likes,
        comments: details.comments,
        shares: details.shares,
        saves: details.saves,
      },
    };
  },
});
