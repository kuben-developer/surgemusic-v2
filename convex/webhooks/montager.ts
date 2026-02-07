import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

/**
 * GET /api/montager/pending
 *
 * Fetches all pending montage configs with randomly selected clips.
 * Each call returns a fresh random selection of clips for each montage.
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "configId": "j572...",
 *       "montagerFolderId": "j573...",
 *       "folderName": "my-montages",
 *       "numberOfMontages": 5,
 *       "totalClipsAvailable": 100,
 *       "montages": [
 *         { "clips": ["https://clip1.mp4", "https://clip2.mp4", ...] }
 *       ]
 *     }
 *   ],
 *   "count": 1
 * }
 */
export const getPendingMontagerConfigs = httpAction(async (ctx) => {
  try {
    const pendingConfigs = await ctx.runAction(
      internal.app.montagerDb.buildPendingConfigsWithClips
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: pendingConfigs,
        count: pendingConfigs.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in getPendingMontagerConfigs:", error);
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
 * POST /api/montager/update
 *
 * Updates montager with generated video URLs.
 * Adds videos to montagerVideos table and marks config as processed.
 *
 * Request body format:
 * {
 *   "updates": [
 *     {
 *       "configId": "j572...",
 *       "videos": [
 *         {
 *           "videoUrl": "https://...",
 *           "thumbnailUrl": "https://..."
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * Response format:
 * {
 *   "success": true,
 *   "updated": 1,
 *   "failed": 0,
 *   "results": [
 *     { "configId": "j572...", "videosAdded": 5, "success": true }
 *   ]
 * }
 */
export const updateMontagerVideos = httpAction(async (ctx, request) => {
  try {
    // Parse request body
    const body = await request.json();

    if (!body.updates || !Array.isArray(body.updates)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request body. Expected { updates: [...] }",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate each update entry
    for (const update of body.updates) {
      if (!update.configId || !update.videos) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Each update must have configId and videos",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (!Array.isArray(update.videos)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "videos must be an array",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Validate each video entry
      for (const video of update.videos) {
        if (
          typeof video.videoUrl !== "string" ||
          typeof video.thumbnailUrl !== "string"
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Each video must have: videoUrl (string), thumbnailUrl (string)",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    // Process each update
    const results = await Promise.allSettled(
      body.updates.map(
        async (update: {
          configId: string;
          videos: Array<{
            videoUrl: string;
            thumbnailUrl: string;
          }>;
        }) => {
          const result = await ctx.runMutation(
            internal.app.montagerDb.updateVideosExternal,
            {
              configId: update.configId as Id<"montageConfigs">,
              videos: update.videos,
            }
          );
          return result;
        }
      )
    );

    // Count successes and failures
    const successResults = results.filter((r) => r.status === "fulfilled");
    const failedResults = results.filter((r) => r.status === "rejected");

    // Build results array
    const resultDetails = results.map((r, index) => {
      if (r.status === "fulfilled") {
        return {
          configId: body.updates[index].configId,
          videosAdded: r.value.videosAdded,
          success: true,
        };
      } else {
        return {
          configId: body.updates[index].configId,
          success: false,
          error: (r as PromiseRejectedResult).reason?.message || "Unknown error",
        };
      }
    });

    return new Response(
      JSON.stringify({
        success: failedResults.length === 0,
        updated: successResults.length,
        failed: failedResults.length,
        results: resultDetails,
      }),
      {
        status: failedResults.length === 0 ? 200 : 207, // 207 Multi-Status for partial success
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in updateMontagerVideos:", error);
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
