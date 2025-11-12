"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";

const TOKAPI_KEY = "808a45b29cf9422798bcc4560909b4c2";

/**
 * Fetches TikTok video stats by video ID using TOKAPI service
 * Used for getlate posts and manual video scraping
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
    try {
      const videoId = String(args.videoId);
      const requestUrl = `http://api.tokapi.online/v1/post/${videoId}`;

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          'accept': 'application/json',
          'x-project-name': 'tokapi',
          'x-api-key': TOKAPI_KEY
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        console.error(`Failed to fetch video ${videoId}: HTTP ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}`
        };
      }

      const data = await response.json();

      // Check for errors in response
      if (data.status_code !== 0 || !data.aweme_detail) {
        return {
          success: false,
          error: data.status_msg || 'Video not found'
        };
      }

      const aweme = data.aweme_detail;
      const stats = aweme.statistics;

      if (!stats) {
        return {
          success: false,
          error: 'No statistics found'
        };
      }

      return {
        success: true,
        video: {
          videoId,
          views: stats.play_count || 0,
          likes: stats.digg_count || 0,
          comments: stats.comment_count || 0,
          shares: stats.share_count || 0,
          saves: stats.collect_count || 0,
        }
      };
    } catch (error) {
      console.error(`Error fetching video ${args.videoId}:`, error);
      return {
        success: false,
        error: String(error)
      };
    }
  },
});
