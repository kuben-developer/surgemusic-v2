import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

/**
 * GET /api/podcast-clipper/pending
 *
 * Backend polls for pending tasks (calibrate or reframe).
 */
export const getPendingPodcastClipperTasks = httpAction(async (ctx) => {
  try {
    const pendingTasks = await ctx.runQuery(
      internal.app.podcastClipperDb.getPendingTasksInternal
    );

    // Mark tasks as processing so they aren't picked up again
    for (const task of pendingTasks) {
      await ctx.runMutation(
        internal.app.podcastClipperDb.markTaskProcessing,
        { taskId: task.taskId }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: pendingTasks,
        count: pendingTasks.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in getPendingPodcastClipperTasks:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * POST /api/podcast-clipper/upload-url
 *
 * Backend requests a Convex storage upload URL for frames/histograms.
 */
export const getPodcastClipperUploadUrl = httpAction(async (ctx) => {
  try {
    const uploadUrl = await ctx.storage.generateUploadUrl();

    return new Response(
      JSON.stringify({ success: true, uploadUrl }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in getPodcastClipperUploadUrl:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * POST /api/podcast-clipper/calibration-result
 *
 * Backend pushes scene detection results after calibration.
 *
 * Body:
 * {
 *   taskId: string,
 *   folderId: string,
 *   sourceWidth: number,
 *   sourceHeight: number,
 *   sceneThreshold: number,
 *   clusterThreshold: number,
 *   sceneTypes: [{ sceneTypeId, frameStorageId, histogramStorageId }]
 * }
 */
export const postCalibrationResult = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.taskId || !body.folderId || !body.sceneTypes) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: taskId, folderId, sceneTypes",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await ctx.runMutation(
      internal.app.podcastClipperDb.saveCalibrationResult,
      {
        taskId: body.taskId as Id<"podcastClipperTasks">,
        folderId: body.folderId as Id<"podcastClipperFolders">,
        sourceWidth: body.sourceWidth,
        sourceHeight: body.sourceHeight,
        sceneThreshold: body.sceneThreshold,
        clusterThreshold: body.clusterThreshold,
        sceneTypes: body.sceneTypes.map(
          (st: { sceneTypeId: number; frameStorageId: string; histogramStorageId: string }) => ({
            sceneTypeId: st.sceneTypeId,
            frameStorageId: st.frameStorageId as Id<"_storage">,
            histogramStorageId: st.histogramStorageId as Id<"_storage">,
          })
        ),
      }
    );

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in postCalibrationResult:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * POST /api/podcast-clipper/reframe-result
 *
 * Backend pushes reframed video URL.
 *
 * Body: { taskId, videoId, reframedVideoUrl }
 */
export const postReframeResult = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.taskId || !body.videoId || !body.reframedVideoUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: taskId, videoId, reframedVideoUrl",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await ctx.runMutation(
      internal.app.podcastClipperDb.saveReframeResult,
      {
        taskId: body.taskId as Id<"podcastClipperTasks">,
        videoId: body.videoId as Id<"podcastClipperVideos">,
        reframedVideoUrl: body.reframedVideoUrl,
      }
    );

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in postReframeResult:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * POST /api/podcast-clipper/task-failed
 *
 * Backend reports a task failure.
 *
 * Body: { taskId, errorMessage }
 */
export const postTaskFailed = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.taskId || !body.errorMessage) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: taskId, errorMessage",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await ctx.runMutation(
      internal.app.podcastClipperDb.failTask,
      {
        taskId: body.taskId as Id<"podcastClipperTasks">,
        errorMessage: body.errorMessage,
      }
    );

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in postTaskFailed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
