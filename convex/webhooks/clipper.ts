import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

/**
 * GET /api/clipper/pending
 *
 * Fetches all videos from clippedVideoUrls table where outputUrls is empty.
 * These are videos that are waiting to be processed by an external system.
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "j572...",
 *       "clipperFolderId": "j573...",
 *       "folderName": "my-project",
 *       "inputVideoName": "my-video",
 *       "inputVideoUrl": "https://..."
 *     }
 *   ],
 *   "count": 1
 * }
 */
export const getPendingClipperVideos = httpAction(async (ctx) => {
  try {
    const pendingVideos = await ctx.runQuery(
      internal.app.clipperDb.getPendingVideosInternal
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
    console.error("Error in getPendingClipperVideos:", error);
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
 * POST /api/clipper/update
 *
 * Updates clippedVideoUrls records with output clip URLs and metadata.
 *
 * Request body format:
 * {
 *   "updates": [
 *     {
 *       "videoId": "j572...",
 *       "outputUrls": [
 *         {
 *           "videoUrl": "https://...",
 *           "thumbnailUrl": "https://...",
 *           "clipNumber": 1,
 *           "brightness": 75,
 *           "clarity": 90,
 *           "isDeleted": false  // optional, defaults to false
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
 *     { "videoId": "j572...", "clipCount": 5, "success": true }
 *   ]
 * }
 */
export const updateClipperVideoOutputs = httpAction(async (ctx, request) => {
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
      if (!update.videoId || !update.outputUrls) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Each update must have videoId and outputUrls",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (!Array.isArray(update.outputUrls)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "outputUrls must be an array",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Validate each output URL entry
      for (const output of update.outputUrls) {
        if (
          typeof output.videoUrl !== "string" ||
          typeof output.thumbnailUrl !== "string" ||
          typeof output.clipNumber !== "number" ||
          typeof output.brightness !== "number" ||
          typeof output.clarity !== "number"
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "Each outputUrl must have: videoUrl (string), thumbnailUrl (string), clipNumber (number), brightness (number), clarity (number)",
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
          videoId: string;
          outputUrls: Array<{
            videoUrl: string;
            thumbnailUrl: string;
            clipNumber: number;
            brightness: number;
            clarity: number;
            isDeleted?: boolean;
          }>;
        }) => {
          const result = await ctx.runMutation(
            internal.app.clipperDb.updateVideoOutputsExternal,
            {
              videoId: update.videoId as Id<"clippedVideoUrls">,
              outputUrls: update.outputUrls,
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
          clipCount: r.value.clipCount,
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
    console.error("Error in updateClipperVideoOutputs:", error);
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
