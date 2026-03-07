import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

const jsonResponse = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * GET /api/podcast-clipper/clip-jobs/pending
 *
 * Docker service polls for download/transcribe/cut_clips jobs.
 */
export const getPendingClipJobs = httpAction(async (ctx) => {
  try {
    const jobs = await ctx.runQuery(
      internal.app.podcastClipperClipsDb.getPendingClipJobsInternal
    );

    // Mark jobs as processing
    for (const job of jobs) {
      await ctx.runMutation(
        internal.app.podcastClipperClipsDb.markClipJobProcessing,
        { jobId: job.jobId }
      );
    }

    return jsonResponse({ success: true, data: jobs, count: jobs.length });
  } catch (error) {
    console.error("Error in getPendingClipJobs:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

/**
 * POST /api/podcast-clipper/download-result
 *
 * Docker posts downloaded video URL.
 * Body: { jobId, videoId, videoUrl, videoName }
 */
export const postDownloadResult = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.jobId || !body.videoId || !body.videoUrl) {
      return jsonResponse(
        { success: false, error: "Missing required fields: jobId, videoId, videoUrl" },
        400
      );
    }

    await ctx.runMutation(
      internal.app.podcastClipperClipsDb.saveDownloadResult,
      {
        jobId: body.jobId as Id<"podcastClipperClipJobs">,
        videoId: body.videoId as Id<"podcastClipperVideos">,
        videoUrl: body.videoUrl,
        videoName: body.videoName ?? "Downloaded Video",
      }
    );

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error in postDownloadResult:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

/**
 * POST /api/podcast-clipper/transcript-result
 *
 * Docker posts word-level transcript.
 * Body: { jobId, folderId, videoId, fullText, words, language? }
 *
 * Words are stored as a JSON blob in Convex storage to avoid document/arg size limits.
 */
export const postTranscriptResult = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.jobId || !body.folderId || !body.videoId || !body.words) {
      return jsonResponse(
        { success: false, error: "Missing required fields" },
        400
      );
    }

    // Store words array as JSON blob in Convex storage
    const wordsBlob = new Blob([JSON.stringify(body.words)], {
      type: "application/json",
    });
    const wordsStorageId = await ctx.storage.store(wordsBlob);

    // Extract unique speaker IDs for the document (small, used by UI)
    const speakerIds = [
      ...new Set(
        (body.words as Array<{ speakerId?: string }>)
          .map((w) => w.speakerId)
          .filter((id): id is string => !!id)
      ),
    ];

    await ctx.runMutation(
      internal.app.podcastClipperClipsDb.saveTranscriptResult,
      {
        jobId: body.jobId as Id<"podcastClipperClipJobs">,
        folderId: body.folderId as Id<"podcastClipperFolders">,
        videoId: body.videoId as Id<"podcastClipperVideos">,
        wordsStorageId,
        speakerIds,
        fullText: body.fullText ?? "",
        language: body.language,
      }
    );

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error in postTranscriptResult:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

/**
 * POST /api/podcast-clipper/cut-clips-result
 *
 * Docker posts cut clip URLs.
 * Body: { jobId, folderId, clips: [{ clipId, cutVideoUrl }] }
 */
export const postCutClipsResult = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.jobId || !body.clips) {
      return jsonResponse(
        { success: false, error: "Missing required fields: jobId, clips" },
        400
      );
    }

    await ctx.runMutation(
      internal.app.podcastClipperClipsDb.saveCutClipsResult,
      {
        jobId: body.jobId as Id<"podcastClipperClipJobs">,
        folderId: body.folderId as Id<"podcastClipperFolders">,
        clips: body.clips.map((c: any) => ({
          clipId: c.clipId as Id<"podcastClipperClips">,
          cutVideoUrl: c.cutVideoUrl,
        })),
      }
    );

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error in postCutClipsResult:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

/**
 * POST /api/podcast-clipper/clip-reframe-result
 *
 * Lambda posts reframed clip URL.
 * Body: { clipId, reframedVideoUrl }
 */
export const postClipReframeResult = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.clipId || !body.reframedVideoUrl) {
      return jsonResponse(
        { success: false, error: "Missing required fields: clipId, reframedVideoUrl" },
        400
      );
    }

    await ctx.runMutation(
      internal.app.podcastClipperClipsDb.saveClipReframeResult,
      {
        clipId: body.clipId as Id<"podcastClipperClips">,
        reframedVideoUrl: body.reframedVideoUrl,
      }
    );

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error in postClipReframeResult:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

/**
 * GET /api/podcast-clipper/clips/pending-overlay
 *
 * Remotion Lambda polls for clips needing subtitle+hook overlay.
 */
export const getPendingOverlayClips = httpAction(async (ctx) => {
  try {
    const clips = await ctx.runAction(
      internal.app.podcastClipperClipsDb.getPendingOverlayClipsInternal
    );

    // Mark as rendering
    if (clips.length > 0) {
      await ctx.runMutation(
        internal.app.podcastClipperClipsDb.markOverlayRendering,
        { clipIds: clips.map((c: any) => c.clipId) }
      );
    }

    return jsonResponse({ success: true, data: clips, count: clips.length });
  } catch (error) {
    console.error("Error in getPendingOverlayClips:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

/**
 * POST /api/podcast-clipper/clips/overlay-result
 *
 * Remotion Lambda posts final rendered clip URLs.
 * Body: { clipId, finalVideoUrl, thumbnailUrl? }
 */
export const postOverlayResult = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.clipId || !body.finalVideoUrl) {
      return jsonResponse(
        { success: false, error: "Missing required fields: clipId, finalVideoUrl" },
        400
      );
    }

    await ctx.runMutation(
      internal.app.podcastClipperClipsDb.saveOverlayResult,
      {
        clipId: body.clipId as Id<"podcastClipperClips">,
        finalVideoUrl: body.finalVideoUrl,
        thumbnailUrl: body.thumbnailUrl,
      }
    );

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error in postOverlayResult:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

/**
 * POST /api/podcast-clipper/clips/overlay-failed
 *
 * Remotion service reports a render failure. Resets clip to "reframed" so it can be retried.
 * Body: { clipId, errorMessage }
 */
export const postOverlayFailed = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (!body.clipId) {
      return jsonResponse({ success: false, error: "Missing clipId" }, 400);
    }

    await ctx.runMutation(
      internal.app.podcastClipperClipsDb.resetOverlayClip,
      {
        clipId: body.clipId as Id<"podcastClipperClips">,
        errorMessage: body.errorMessage ?? "Unknown render error",
      }
    );

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Error in postOverlayFailed:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});
