import { httpAction } from "../_generated/server";
import { api, internal } from "../_generated/api";

/**
 * GET /api/generatedVideos/pending
 *
 * Fetches all videos from generatedVideos table where generatedVideoUrl is null,
 * grouped by campaignId and overlayStyle, with associated campaign assets and captions.
 *
 * Response format:
 * [
 *   {
 *     "videoUrls": ["url1", "url2", ...],
 *     "subtitlesUrl": "...",
 *     "audioUrl": "...",
 *     "overlayStyle": "blend|brat|pink|tiktok",
 *     "captionTexts": ["text1", "text2"],
 *     "campaignId": "recK2FEC9YDXc0BKs"
 *   }
 * ]
 */
export const getPendingVideos = httpAction(async (ctx, request) => {
  try {
    // Fetch all videos where generatedVideoUrl is null
    const pendingVideos = await ctx.runQuery(
      internal.app.generatedVideos.getPendingVideosInternal
    );

    if (!pendingVideos || pendingVideos.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          message: "No pending videos found"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Group videos by campaignId and overlayStyle
    const groupedVideos = new Map<string, {
      campaignId: string;
      overlayStyle: string;
      videoUrls: string[];
    }>();

    for (const video of pendingVideos) {
      const key = `${video.campaignId}-${video.overlayStyle}`;

      if (!groupedVideos.has(key)) {
        groupedVideos.set(key, {
          campaignId: video.campaignId,
          overlayStyle: video.overlayStyle,
          videoUrls: [],
        });
      }

      groupedVideos.get(key)!.videoUrls.push(video.videoUrl);
    }

    // For each group, fetch campaign assets and captions
    const results = await Promise.all(
      Array.from(groupedVideos.values()).map(async (group) => {
        // Fetch campaign assets
        const assets = await ctx.runQuery(
          internal.app.campaignAssets.getAssetsByCampaignIdInternal,
          { campaignId: group.campaignId }
        );

        // Fetch captions
        const captions = await ctx.runQuery(
          api.app.captions.list,
          { campaignId: group.campaignId }
        );

        return {
          videoUrls: group.videoUrls,
          subtitlesUrl: assets?.srtUrl || null,
          audioUrl: assets?.audioUrl || null,
          overlayStyle: group.overlayStyle,
          captionTexts: captions.map((c) => c.text),
          campaignId: group.campaignId,
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        count: results.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in getPendingVideos:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * POST /api/generatedVideos/update
 *
 * Updates generatedVideos records with new generatedVideoUrl values.
 *
 * Request body format:
 * {
 *   "updates": [
 *     {
 *       "generatedVideoId": "campaignId-category-niche",
 *       "generatedVideoUrl": "https://..."
 *     }
 *   ]
 * }
 *
 * Response format:
 * {
 *   "success": true,
 *   "updated": 3,
 *   "failed": 0
 * }
 */
export const updateGeneratedVideos = httpAction(async (ctx, request) => {
  try {
    // Parse request body
    const body = await request.json();

    if (!body.updates || !Array.isArray(body.updates)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request body. Expected { updates: [...] }"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate each update entry
    for (const update of body.updates) {
      if (!update.generatedVideoId || !update.generatedVideoUrl) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Each update must have generatedVideoId and generatedVideoUrl"
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Update each video
    const results = await Promise.allSettled(
      body.updates.map((update: { generatedVideoId: string; generatedVideoUrl: string }) =>
        ctx.runMutation(
          internal.app.generatedVideos.updateGeneratedVideoUrlInternal,
          {
            generatedVideoId: update.generatedVideoId,
            generatedVideoUrl: update.generatedVideoUrl,
          }
        )
      )
    );

    // Count successes and failures
    const updated = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    // Collect error messages for failed updates
    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message || "Unknown error");

    return new Response(
      JSON.stringify({
        success: failed === 0,
        updated,
        failed,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: failed === 0 ? 200 : 207, // 207 Multi-Status for partial success
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in updateGeneratedVideos:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
