import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { internal } from "../_generated/api";

// ============================================================
// USER-FACING QUERIES
// ============================================================

export const getTranscript = query({
  args: { folderId: v.id("podcastClipperFolders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("podcastClipperTranscripts")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .first();
  },
});

export const getClips = query({
  args: { folderId: v.id("podcastClipperFolders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("podcastClipperClips")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
  },
});

export const getClipJobs = query({
  args: { folderId: v.id("podcastClipperFolders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("podcastClipperClipJobs")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
  },
});

// ============================================================
// USER-FACING MUTATIONS
// ============================================================

export const deleteClip = mutation({
  args: { clipId: v.id("podcastClipperClips") },
  handler: async (ctx, args) => {
    const clip = await ctx.db.get(args.clipId);
    if (!clip) return;
    await ctx.db.delete(args.clipId);
  },
});

export const startTranscription = mutation({
  args: {
    folderId: v.id("podcastClipperFolders"),
    videoId: v.id("podcastClipperVideos"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) throw new Error("Folder not found");

    const jobId = await ctx.db.insert("podcastClipperClipJobs", {
      folderId: args.folderId,
      videoId: args.videoId,
      type: "transcribe",
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.folderId, { transcriptionStatus: "pending" });

    return jobId;
  },
});

export const updateSpeakerNames = mutation({
  args: {
    transcriptId: v.id("podcastClipperTranscripts"),
    speakerNames: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.patch(args.transcriptId, {
      speakerNames: args.speakerNames,
    });
  },
});

export const processApprovedClips = mutation({
  args: {
    folderId: v.id("podcastClipperFolders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) throw new Error("Folder not found");

    // Get all approved clips
    const approvedClips = await ctx.db
      .query("podcastClipperClips")
      .withIndex("by_folderId_status", (q) =>
        q.eq("folderId", args.folderId).eq("status", "approved")
      )
      .collect();

    if (approvedClips.length === 0) throw new Error("No approved clips to process");

    // Get the video ID from the first clip
    const videoId = approvedClips[0].videoId;

    // Mark all approved clips as "cutting"
    for (const clip of approvedClips) {
      await ctx.db.patch(clip._id, { status: "cutting" });
    }

    // Create a cut_clips job
    await ctx.db.insert("podcastClipperClipJobs", {
      folderId: args.folderId,
      videoId,
      type: "cut_clips",
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Wrapper mutation called from the frontend to trigger the generateClips action
export const triggerGenerateClips = mutation({
  args: {
    folderId: v.id("podcastClipperFolders"),
    videoId: v.id("podcastClipperVideos"),
    transcriptId: v.id("podcastClipperTranscripts"),
    minClipDuration: v.number(),
    maxClipDuration: v.number(),
    minClipsPerHour: v.number(),
    maxClipsPerHour: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.scheduler.runAfter(0, internal.app.podcastClipperClipsActions.generateClips, {
      folderId: args.folderId,
      videoId: args.videoId,
      transcriptId: args.transcriptId,
      minClipDuration: args.minClipDuration,
      maxClipDuration: args.maxClipDuration,
      minClipsPerHour: args.minClipsPerHour,
      maxClipsPerHour: args.maxClipsPerHour,
    });
  },
});

// ============================================================
// INTERNAL QUERIES
// ============================================================

export const getTranscriptInternal = internalQuery({
  args: { transcriptId: v.id("podcastClipperTranscripts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.transcriptId);
  },
});

export const getPendingClipJobsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const jobs: any[] = [];

    for (const jobType of ["download", "transcribe", "cut_clips"] as const) {
      const pending = await ctx.db
        .query("podcastClipperClipJobs")
        .withIndex("by_type_status", (q) => q.eq("type", jobType).eq("status", "pending"))
        .collect();

      for (const job of pending) {
        const video = await ctx.db.get(job.videoId);
        if (!video) continue;

        const result: any = {
          jobId: job._id,
          folderId: job.folderId,
          videoId: job.videoId,
          type: job.type,
          videoUrl: video.inputVideoUrl,
          youtubeUrl: video.youtubeUrl,
        };

        // For cut_clips, include clip data
        if (jobType === "cut_clips") {
          const clips = await ctx.db
            .query("podcastClipperClips")
            .withIndex("by_folderId_status", (q) =>
              q.eq("folderId", job.folderId).eq("status", "cutting")
            )
            .collect();
          result.clips = clips.map((c) => ({
            clipId: c._id,
            startTime: c.startTime,
            endTime: c.endTime,
          }));
        }

        jobs.push(result);
      }
    }

    return jobs;
  },
});

export const getClipReframeData = internalQuery({
  args: { clipId: v.id("podcastClipperClips") },
  handler: async (ctx, args) => {
    const clip = await ctx.db.get(args.clipId);
    if (!clip || !clip.cutVideoUrl) return null;

    const config = await ctx.db
      .query("podcastClipperConfigs")
      .withIndex("by_folderId", (q) => q.eq("folderId", clip.folderId))
      .unique();
    if (!config) return null;

    const sceneTypes = await ctx.db
      .query("podcastClipperSceneTypes")
      .withIndex("by_folderId", (q) => q.eq("folderId", clip.folderId))
      .collect();

    const sceneTypesWithUrls = await Promise.all(
      sceneTypes.map(async (st) => ({
        sceneTypeId: st.sceneTypeId,
        crop: st.crop,
        altCrop: st.altCrop,
        histogramUrl: await ctx.storage.getUrl(st.histogramStorageId),
      }))
    );

    return {
      clipId: clip._id,
      cutVideoUrl: clip.cutVideoUrl,
      config: {
        sourceWidth: config.sourceWidth,
        sourceHeight: config.sourceHeight,
        sceneThreshold: config.sceneThreshold,
        clusterThreshold: config.clusterThreshold,
      },
      sceneTypes: sceneTypesWithUrls,
    };
  },
});

interface SubtitleWord {
  text: string;
  start: number;
  end: number;
  speakerId: string;
}

function filterOverlappingSpeech(words: SubtitleWord[]): SubtitleWord[] {
  if (words.length === 0) return words;

  // Find words that overlap with words from a different speaker
  const overlapping = new Set<number>();
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (words[i].speakerId === words[j].speakerId) continue;
      if (words[i].start < words[j].end && words[i].end > words[j].start) {
        overlapping.add(i);
        overlapping.add(j);
      }
    }
  }

  if (overlapping.size === 0) return words;

  // Group consecutive overlapping words into segments
  const sortedIndices = Array.from(overlapping).sort((a, b) => a - b);
  const segments: number[][] = [];
  let currentSegment: number[] = [sortedIndices[0]];

  for (let i = 1; i < sortedIndices.length; i++) {
    // Consecutive or near-consecutive indices belong to the same segment
    if (sortedIndices[i] - sortedIndices[i - 1] <= 2) {
      currentSegment.push(sortedIndices[i]);
    } else {
      segments.push(currentSegment);
      currentSegment = [sortedIndices[i]];
    }
  }
  segments.push(currentSegment);

  // For each segment, find the dominant speaker (most total word duration)
  const removeIndices = new Set<number>();
  for (const segment of segments) {
    const durationBySpeaker: Record<string, number> = {};
    for (const idx of segment) {
      const w = words[idx];
      durationBySpeaker[w.speakerId] =
        (durationBySpeaker[w.speakerId] ?? 0) + (w.end - w.start);
    }

    let dominantSpeaker = "";
    let maxDuration = 0;
    for (const [speaker, duration] of Object.entries(durationBySpeaker)) {
      if (duration > maxDuration) {
        maxDuration = duration;
        dominantSpeaker = speaker;
      }
    }

    // Remove non-dominant speaker words from this segment
    for (const idx of segment) {
      if (words[idx].speakerId !== dominantSpeaker) {
        removeIndices.add(idx);
      }
    }
  }

  return words.filter((_, i) => !removeIndices.has(i));
}

export const getPendingOverlayClipsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const clips = await ctx.db
      .query("podcastClipperClips")
      .withIndex("by_status", (q) => q.eq("status", "reframed"))
      .collect();

    const results = [];
    for (const clip of clips) {
      if (!clip.reframedVideoUrl) continue;

      // Get transcript for subtitle cues
      const transcript = await ctx.db
        .query("podcastClipperTranscripts")
        .withIndex("by_videoId", (q) => q.eq("videoId", clip.videoId))
        .first();

      // Filter and shift word timestamps to clip time range
      const mappedWords: SubtitleWord[] = transcript
        ? transcript.words
            .filter(
              (w) =>
                w.type === "word" &&
                w.start >= clip.startTime &&
                w.end <= clip.endTime
            )
            .map((w) => ({
              text: w.text,
              start: w.start - clip.startTime,
              end: w.end - clip.startTime,
              speakerId: w.speakerId ?? "unknown",
            }))
        : [];

      const subtitleCues = filterOverlappingSpeech(mappedWords);

      results.push({
        clipId: clip._id,
        videoUrl: clip.reframedVideoUrl,
        hookText: clip.hookText,
        overlayStyle: clip.overlayStyle ?? "tiktok",
        subtitleCues,
      });
    }

    return results;
  },
});

// ============================================================
// INTERNAL MUTATIONS
// ============================================================

export const markClipJobProcessing = internalMutation({
  args: { jobId: v.id("podcastClipperClipJobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, { status: "processing" });
  },
});

export const saveDownloadResult = internalMutation({
  args: {
    jobId: v.id("podcastClipperClipJobs"),
    videoId: v.id("podcastClipperVideos"),
    videoUrl: v.string(),
    videoName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.videoId, {
      inputVideoUrl: args.videoUrl,
      videoName: args.videoName,
      status: "uploaded",
    });

    await ctx.db.patch(args.jobId, { status: "completed" });
  },
});

export const saveTranscriptResult = internalMutation({
  args: {
    jobId: v.id("podcastClipperClipJobs"),
    folderId: v.id("podcastClipperFolders"),
    videoId: v.id("podcastClipperVideos"),
    fullText: v.string(),
    words: v.array(
      v.object({
        text: v.string(),
        start: v.number(),
        end: v.number(),
        type: v.string(),
        speakerId: v.optional(v.string()),
      })
    ),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("podcastClipperTranscripts", {
      folderId: args.folderId,
      videoId: args.videoId,
      fullText: args.fullText,
      words: args.words,
      language: args.language,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.jobId, { status: "completed" });
    await ctx.db.patch(args.folderId, { transcriptionStatus: "completed" });
  },
});

export const saveGeneratedClips = internalMutation({
  args: {
    folderId: v.id("podcastClipperFolders"),
    videoId: v.id("podcastClipperVideos"),
    transcriptId: v.id("podcastClipperTranscripts"),
    clips: v.array(
      v.object({
        startTime: v.number(),
        endTime: v.number(),
        hookText: v.string(),
        title: v.optional(v.string()),
        clipIndex: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const clip of args.clips) {
      await ctx.db.insert("podcastClipperClips", {
        folderId: args.folderId,
        videoId: args.videoId,
        transcriptId: args.transcriptId,
        startTime: clip.startTime,
        endTime: clip.endTime,
        hookText: clip.hookText,
        title: clip.title,
        status: "approved",
        clipIndex: clip.clipIndex,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(args.folderId, {
      clipCount: args.clips.length,
      completedClipCount: 0,
    });
  },
});

export const saveCutClipsResult = internalMutation({
  args: {
    jobId: v.id("podcastClipperClipJobs"),
    folderId: v.id("podcastClipperFolders"),
    clips: v.array(
      v.object({
        clipId: v.id("podcastClipperClips"),
        cutVideoUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const clip of args.clips) {
      await ctx.db.patch(clip.clipId, {
        cutVideoUrl: clip.cutVideoUrl,
        status: "cut",
      });

      // Auto-trigger reframe Lambda for each cut clip
      await ctx.scheduler.runAfter(
        0,
        internal.services.reframeLambda.invokeClipReframe,
        { clipId: clip.clipId }
      );
    }

    await ctx.db.patch(args.jobId, { status: "completed" });
  },
});

export const updateClipStatus = internalMutation({
  args: {
    clipId: v.id("podcastClipperClips"),
    status: v.union(
      v.literal("approved"),
      v.literal("cutting"),
      v.literal("cut"),
      v.literal("reframing"),
      v.literal("reframed"),
      v.literal("rendering_overlay"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clipId, { status: args.status });
  },
});

export const resetOverlayClip = internalMutation({
  args: {
    clipId: v.id("podcastClipperClips"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const clip = await ctx.db.get(args.clipId);
    if (!clip) return;
    // Reset to reframed so it gets picked up again on next poll
    if (clip.status === "rendering_overlay") {
      console.warn(`Overlay failed for clip ${args.clipId}: ${args.errorMessage}`);
      await ctx.db.patch(args.clipId, { status: "reframed" });
    }
  },
});

export const saveClipReframeResult = internalMutation({
  args: {
    clipId: v.id("podcastClipperClips"),
    reframedVideoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clipId, {
      reframedVideoUrl: args.reframedVideoUrl,
      status: "reframed",
    });
  },
});

export const saveOverlayResult = internalMutation({
  args: {
    clipId: v.id("podcastClipperClips"),
    finalVideoUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clip = await ctx.db.get(args.clipId);
    if (!clip) throw new Error("Clip not found");

    await ctx.db.patch(args.clipId, {
      finalVideoUrl: args.finalVideoUrl,
      thumbnailUrl: args.thumbnailUrl,
      status: "completed",
    });

    // Update folder completed count
    const folder = await ctx.db.get(clip.folderId);
    if (folder) {
      await ctx.db.patch(clip.folderId, {
        completedClipCount: (folder.completedClipCount ?? 0) + 1,
      });
    }
  },
});

export const failClip = internalMutation({
  args: {
    clipId: v.id("podcastClipperClips"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clipId, {
      status: "failed",
      errorMessage: args.errorMessage,
    });
  },
});

export const failClipJob = internalMutation({
  args: {
    jobId: v.id("podcastClipperClipJobs"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;

    await ctx.db.patch(args.jobId, {
      status: "failed",
      errorMessage: args.errorMessage,
    });

    // Update folder transcription status if transcribe job failed
    if (job.type === "transcribe") {
      await ctx.db.patch(job.folderId, { transcriptionStatus: "failed" });
    }

    // If download job failed, mark video as failed
    if (job.type === "download") {
      await ctx.db.patch(job.videoId, {
        status: "failed",
        errorMessage: args.errorMessage,
      });
    }
  },
});

export const markOverlayRendering = internalMutation({
  args: {
    clipIds: v.array(v.id("podcastClipperClips")),
  },
  handler: async (ctx, args) => {
    for (const clipId of args.clipIds) {
      await ctx.db.patch(clipId, { status: "rendering_overlay" });
    }
  },
});
