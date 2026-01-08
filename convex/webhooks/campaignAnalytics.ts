import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

interface TopVideoData {
  videoId: string;
  postId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  videoUrl?: string;
  mediaUrl?: string;
}

/**
 * GET /api/campaigns
 *
 * Public API endpoint to fetch all campaigns from Airtable.
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "recXXX",
 *       "name": "Campaign Name",
 *       "artistName": "Artist Name",
 *       "songName": "Song Name",
 *       "status": "Active"
 *     }
 *   ],
 *   "count": 10
 * }
 */
export const getAllCampaignsPublic = httpAction(async (ctx) => {
  try {
    const campaigns = await ctx.runAction(
      internal.webhooks.campaignAnalyticsQueries.getAllCampaignsInternal,
      {}
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: campaigns,
        count: campaigns.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in getAllCampaignsPublic:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Cost per video for CPM calculation
 */
const COST_PER_VIDEO = 0.50;

/**
 * Calculate CPM (Cost Per Thousand views)
 *
 * Formula: CPM = (Total Cost / Total Views) × 1000
 * Where Total Cost = Number of Videos × $0.50
 */
function calculateCPM(totalViews: number, numberOfVideos: number): number {
  if (totalViews === 0) return 0;
  const totalCost = numberOfVideos * COST_PER_VIDEO;
  return (totalCost / totalViews) * 1000;
}

/**
 * GET /api/campaign-analytics
 *
 * Public API endpoint to fetch campaign analytics data by Airtable campaign ID.
 *
 * Query parameters:
 *   - campaignId (required): Airtable campaign ID
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "artistName": "Artist Name",
 *     "songName": "Song Name",
 *     "totalPosts": 100,
 *     "totalViews": 1000000,
 *     "totalLikes": 50000,
 *     "totalComments": 5000,
 *     "totalShares": 2000,
 *     "cpm": 0.05,
 *     "topPerformingPosts": [
 *       {
 *         "views": 100000,
 *         "likes": 5000,
 *         "shares": 200,
 *         "comments": 500,
 *         "postUrl": "https://..."
 *       }
 *     ]
 *   }
 * }
 */
export const getCampaignAnalyticsPublic = httpAction(async (ctx, request) => {
  try {
    // Parse campaign ID from query parameters
    const url = new URL(request.url);
    const campaignId = url.searchParams.get("campaignId");

    if (!campaignId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required query parameter: campaignId",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch campaign analytics and top videos
    const [analyticsData, topVideos] = await Promise.all([
      ctx.runQuery(internal.webhooks.campaignAnalyticsQueries.getCampaignAnalyticsInternal, {
        campaignId,
      }),
      ctx.runQuery(internal.webhooks.campaignAnalyticsQueries.getTopVideosInternal, {
        campaignId,
        limit: 5,
      }),
    ]);

    if (!analyticsData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Campaign analytics not found for campaignId: ${campaignId}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Calculate CPM
    const cpm = calculateCPM(analyticsData.totalViews, analyticsData.totalPosts);

    // Build top performing posts array
    const topPerformingPosts = topVideos.map((video: TopVideoData) => ({
      views: video.views,
      likes: video.likes,
      shares: video.shares,
      comments: video.comments,
      postUrl: video.videoUrl || video.mediaUrl || null,
    }));

    // Build content samples array
    const contentSamples = (analyticsData.contentSamples ?? []).map((sample: { videoUrl: string; thumbnailUrl: string }) => ({
      videoUrl: sample.videoUrl,
      thumbnailUrl: sample.thumbnailUrl,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          artistName: analyticsData.artist,
          songName: analyticsData.song,
          totalPosts: analyticsData.totalPosts,
          totalViews: analyticsData.totalViews,
          totalLikes: analyticsData.totalLikes,
          totalComments: analyticsData.totalComments,
          totalShares: analyticsData.totalShares,
          cpm: Number(cpm.toFixed(4)),
          topPerformingPosts,
          contentSamples,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in getCampaignAnalyticsPublic:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
