import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

/**
 * GET /api/montager-videos/pending
 *
 * Fetches all montager videos that are ready for processing.
 * These are videos that have been assigned to Airtable records
 * and need overlay processing applied.
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "videoId": "j572...",
 *       "videoUrl": "https://...",
 *       "thumbnailUrl": "https://...",
 *       "overlayStyle": "Style A",
 *       "airtableRecordId": "rec..."
 *     }
 *   ],
 *   "count": 5
 * }
 */
export const getPendingVideosForProcessing = httpAction(async (ctx) => {
  try {
    const pendingVideos = await ctx.runQuery(
      internal.app.montagerDb.getPendingVideosForProcessingInternal
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: pendingVideos,
        count: pendingVideos.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in getPendingVideosForProcessing:", error);
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
 * POST /api/montager-videos/update
 *
 * Updates montager videos with processed video URLs.
 * Sets the processedVideoUrl and changes status to "processed".
 *
 * Request body format:
 * {
 *   "updates": [
 *     {
 *       "videoId": "j572...",
 *       "processedVideoUrl": "https://..."
 *     }
 *   ]
 * }
 *
 * Response format:
 * {
 *   "success": true,
 *   "updated": 5,
 *   "failed": 0,
 *   "results": [
 *     { "videoId": "j572...", "success": true }
 *   ]
 * }
 */
export const updateProcessedVideos = httpAction(async (ctx, request) => {
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
      if (!update.videoId || !update.processedVideoUrl) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Each update must have videoId and processedVideoUrl",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (
        typeof update.videoId !== "string" ||
        typeof update.processedVideoUrl !== "string"
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "videoId and processedVideoUrl must be strings",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Process each update
    const results = await Promise.allSettled(
      body.updates.map(
        async (update: { videoId: string; processedVideoUrl: string }) => {
          const result = await ctx.runMutation(
            internal.app.montagerDb.updateProcessedVideoExternal,
            {
              videoId: update.videoId as Id<"montagerVideos">,
              processedVideoUrl: update.processedVideoUrl,
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
          videoId: body.updates[index].videoId,
          success: true,
        };
      } else {
        return {
          videoId: body.updates[index].videoId,
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
    console.error("Error in updateProcessedVideos:", error);
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
