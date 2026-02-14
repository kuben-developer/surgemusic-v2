import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * POST /api/analytics/videos
 *
 * External scraper pushes updated stats for TikTok videos.
 * Body: { videos: [{ tiktokVideoId, views, likes, comments, shares, saves }] }
 * Fans out to one mutation per video via scheduler — returns instantly.
 */
export const updateVideoStats = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const videos = body?.videos;

    if (!Array.isArray(videos) || videos.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or empty videos array" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // console.log(`[V2 API] Updating ${videos.length} videos`);

    const sanitized = videos.map((v: Record<string, unknown>) => ({
      tiktokVideoId: String(v.tiktokVideoId ?? ""),
      views: Number(v.views ?? 0),
      likes: Number(v.likes ?? 0),
      comments: Number(v.comments ?? 0),
      shares: Number(v.shares ?? 0),
      saves: Number(v.saves ?? 0),
    }));

    await ctx.runMutation(
      internal.app.analyticsV2.scheduleVideoStatsUpdates,
      { videos: sanitized },
    );

    return new Response(
      JSON.stringify({ success: true, scheduled: sanitized.length }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[V2 API] Error updating video stats:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

/**
 * GET /api/analytics/campaigns
 *
 * Returns all active campaigns.
 */
export const getActiveCampaigns = httpAction(async (ctx) => {
  try {
    const campaigns = await ctx.runQuery(
      internal.app.analyticsV2.getActiveCampaigns,
      {},
    );

    return new Response(
      JSON.stringify({ success: true, campaigns }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[V2 API] Error getting active campaigns:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

/**
 * GET /api/analytics/campaign-videos?campaignId=X
 *
 * External scraper discovers which videos to scrape.
 * Returns { success, data: { [tiktokAuthorId]: [tiktokVideoId, ...] } }
 */
export const getCampaignVideos = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const campaignId = url.searchParams.get("campaignId");

    if (!campaignId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing campaignId parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await ctx.runQuery(
      internal.app.analyticsV2.getVideosByCampaign,
      { campaignId },
    );

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[V2 API] Error getting campaign videos:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
