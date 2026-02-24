import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";

// ============================================================
// USER-FACING QUERIES
// ============================================================

export const getFolders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const folders = await ctx.db
      .query("podcastClipperFolders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return folders.map((folder) => ({
      ...folder,
      videoCount: folder.videoCount ?? 0,
      reframedCount: folder.reframedCount ?? 0,
      calibrationStatus: folder.calibrationStatus ?? "none",
    }));
  },
});

export const getFolder = query({
  args: { folderId: v.id("podcastClipperFolders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) return null;

    return {
      ...folder,
      videoCount: folder.videoCount ?? 0,
      reframedCount: folder.reframedCount ?? 0,
      calibrationStatus: folder.calibrationStatus ?? "none",
    };
  },
});

export const getVideos = query({
  args: { folderId: v.id("podcastClipperFolders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) return [];

    return await ctx.db
      .query("podcastClipperVideos")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
  },
});

export const getConfig = query({
  args: { folderId: v.id("podcastClipperFolders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("podcastClipperConfigs")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .unique();
  },
});

export const getSceneTypes = query({
  args: { folderId: v.id("podcastClipperFolders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const sceneTypes = await ctx.db
      .query("podcastClipperSceneTypes")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();

    return await Promise.all(
      sceneTypes.map(async (st) => ({
        ...st,
        frameUrl: await ctx.storage.getUrl(st.frameStorageId),
        histogramUrl: await ctx.storage.getUrl(st.histogramStorageId),
      }))
    );
  },
});

export const getTasks = query({
  args: { folderId: v.id("podcastClipperFolders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("podcastClipperTasks")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
  },
});

// ============================================================
// USER-FACING MUTATIONS
// ============================================================

export const createFolder = mutation({
  args: { folderName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("podcastClipperFolders", {
      userId: user._id,
      folderName: args.folderName,
      videoCount: 0,
      reframedCount: 0,
      calibrationStatus: "none",
    });
  },
});

export const deleteFolder = mutation({
  args: { folderId: v.id("podcastClipperFolders") },
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

    // Delete all related records
    const videos = await ctx.db
      .query("podcastClipperVideos")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
    for (const video of videos) {
      await ctx.db.delete(video._id);
    }

    const sceneTypes = await ctx.db
      .query("podcastClipperSceneTypes")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
    for (const st of sceneTypes) {
      await ctx.storage.delete(st.frameStorageId);
      await ctx.storage.delete(st.histogramStorageId);
      await ctx.db.delete(st._id);
    }

    const configs = await ctx.db
      .query("podcastClipperConfigs")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
    for (const config of configs) {
      await ctx.db.delete(config._id);
    }

    const tasks = await ctx.db
      .query("podcastClipperTasks")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.folderId);
  },
});

export const uploadVideo = mutation({
  args: {
    folderId: v.id("podcastClipperFolders"),
    videoName: v.string(),
    inputVideoUrl: v.string(),
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

    const videoId = await ctx.db.insert("podcastClipperVideos", {
      folderId: args.folderId,
      videoName: args.videoName,
      inputVideoUrl: args.inputVideoUrl,
      status: "uploaded",
    });

    await ctx.db.patch(args.folderId, {
      videoCount: (folder.videoCount ?? 0) + 1,
    });

    return videoId;
  },
});

export const deleteVideo = mutation({
  args: { videoId: v.id("podcastClipperVideos") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const video = await ctx.db.get(args.videoId);
    if (!video) throw new Error("Video not found");

    const folder = await ctx.db.get(video.folderId);
    if (!folder || folder.userId !== user._id) throw new Error("Folder not found");

    const hadReframed = video.reframedVideoUrl !== undefined;

    await ctx.db.delete(args.videoId);

    await ctx.db.patch(video.folderId, {
      videoCount: Math.max(0, (folder.videoCount ?? 0) - 1),
      ...(hadReframed
        ? { reframedCount: Math.max(0, (folder.reframedCount ?? 0) - 1) }
        : {}),
    });
  },
});

export const startCalibration = mutation({
  args: {
    folderId: v.id("podcastClipperFolders"),
    referenceVideoId: v.id("podcastClipperVideos"),
    sceneThreshold: v.optional(v.number()),
    clusterThreshold: v.optional(v.number()),
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

    // Mark the video as reference
    await ctx.db.patch(args.referenceVideoId, { isReferenceVideo: true });

    // Clear previous scene types if re-calibrating
    const oldSceneTypes = await ctx.db
      .query("podcastClipperSceneTypes")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
    for (const st of oldSceneTypes) {
      await ctx.storage.delete(st.frameStorageId);
      await ctx.storage.delete(st.histogramStorageId);
      await ctx.db.delete(st._id);
    }

    // Clear previous config
    const oldConfig = await ctx.db
      .query("podcastClipperConfigs")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .unique();
    if (oldConfig) {
      await ctx.db.delete(oldConfig._id);
    }

    const taskId = await ctx.db.insert("podcastClipperTasks", {
      folderId: args.folderId,
      type: "calibrate",
      status: "pending",
      referenceVideoId: args.referenceVideoId,
      sceneThreshold: args.sceneThreshold ?? 27.0,
      clusterThreshold: args.clusterThreshold ?? 0.7,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.folderId, { calibrationStatus: "pending" });

    return taskId;
  },
});

export const saveCropRegions = mutation({
  args: {
    folderId: v.id("podcastClipperFolders"),
    crops: v.array(
      v.object({
        sceneTypeId: v.id("podcastClipperSceneTypes"),
        crop: v.object({
          x: v.number(),
          y: v.number(),
          width: v.number(),
          height: v.number(),
        }),
        altCrop: v.optional(
          v.object({
            x: v.number(),
            y: v.number(),
            width: v.number(),
            height: v.number(),
          })
        ),
      })
    ),
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

    for (const cropData of args.crops) {
      await ctx.db.patch(cropData.sceneTypeId, {
        crop: cropData.crop,
        altCrop: cropData.altCrop,
      });
    }

    await ctx.db.patch(args.folderId, { calibrationStatus: "configured" });
  },
});

export const startReframe = mutation({
  args: {
    folderId: v.id("podcastClipperFolders"),
    videoIds: v.array(v.id("podcastClipperVideos")),
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

    const taskIds = [];
    for (const videoId of args.videoIds) {
      await ctx.db.patch(videoId, { status: "reframing" });

      const taskId = await ctx.db.insert("podcastClipperTasks", {
        folderId: args.folderId,
        type: "reframe",
        status: "pending",
        targetVideoId: videoId,
        createdAt: Date.now(),
      });
      taskIds.push(taskId);
    }

    return taskIds;
  },
});

// ============================================================
// INTERNAL FUNCTIONS (for HTTP endpoints)
// ============================================================

export const getPendingTasksInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const pendingTasks = await ctx.db
      .query("podcastClipperTasks")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const results = [];
    for (const task of pendingTasks) {
      if (task.type === "calibrate" && task.referenceVideoId) {
        const video = await ctx.db.get(task.referenceVideoId);
        if (!video) continue;

        results.push({
          taskId: task._id,
          folderId: task.folderId,
          type: "calibrate" as const,
          referenceVideoUrl: video.inputVideoUrl,
          sceneThreshold: task.sceneThreshold ?? 27.0,
          clusterThreshold: task.clusterThreshold ?? 0.7,
        });
      } else if (task.type === "reframe" && task.targetVideoId) {
        const video = await ctx.db.get(task.targetVideoId);
        if (!video) continue;

        const config = await ctx.db
          .query("podcastClipperConfigs")
          .withIndex("by_folderId", (q) => q.eq("folderId", task.folderId))
          .unique();
        if (!config) continue;

        const sceneTypes = await ctx.db
          .query("podcastClipperSceneTypes")
          .withIndex("by_folderId", (q) => q.eq("folderId", task.folderId))
          .collect();

        const sceneTypesWithUrls = await Promise.all(
          sceneTypes.map(async (st) => ({
            sceneTypeId: st.sceneTypeId,
            crop: st.crop,
            altCrop: st.altCrop,
            histogramUrl: await ctx.storage.getUrl(st.histogramStorageId),
          }))
        );

        results.push({
          taskId: task._id,
          folderId: task.folderId,
          videoId: task.targetVideoId,
          type: "reframe" as const,
          targetVideoUrl: video.inputVideoUrl,
          config: {
            sourceWidth: config.sourceWidth,
            sourceHeight: config.sourceHeight,
            sceneThreshold: config.sceneThreshold,
            clusterThreshold: config.clusterThreshold,
          },
          sceneTypes: sceneTypesWithUrls,
        });
      }
    }

    return results;
  },
});

export const markTaskProcessing = internalMutation({
  args: { taskId: v.id("podcastClipperTasks") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { status: "processing" });
  },
});

export const saveCalibrationResult = internalMutation({
  args: {
    taskId: v.id("podcastClipperTasks"),
    folderId: v.id("podcastClipperFolders"),
    sourceWidth: v.number(),
    sourceHeight: v.number(),
    sceneThreshold: v.number(),
    clusterThreshold: v.number(),
    sceneTypes: v.array(
      v.object({
        sceneTypeId: v.number(),
        frameStorageId: v.id("_storage"),
        histogramStorageId: v.id("_storage"),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Create config
    await ctx.db.insert("podcastClipperConfigs", {
      folderId: args.folderId,
      sourceWidth: args.sourceWidth,
      sourceHeight: args.sourceHeight,
      sceneThreshold: args.sceneThreshold,
      clusterThreshold: args.clusterThreshold,
    });

    // Create scene types
    for (const st of args.sceneTypes) {
      await ctx.db.insert("podcastClipperSceneTypes", {
        folderId: args.folderId,
        sceneTypeId: st.sceneTypeId,
        frameStorageId: st.frameStorageId,
        histogramStorageId: st.histogramStorageId,
      });
    }

    // Update task
    await ctx.db.patch(args.taskId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Update folder status
    await ctx.db.patch(args.folderId, { calibrationStatus: "detected" });
  },
});

export const saveReframeResult = internalMutation({
  args: {
    taskId: v.id("podcastClipperTasks"),
    videoId: v.id("podcastClipperVideos"),
    reframedVideoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) throw new Error("Video not found");

    await ctx.db.patch(args.videoId, {
      reframedVideoUrl: args.reframedVideoUrl,
      status: "reframed",
    });

    await ctx.db.patch(args.taskId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Increment reframed count on folder
    const folder = await ctx.db.get(video.folderId);
    if (folder) {
      await ctx.db.patch(video.folderId, {
        reframedCount: (folder.reframedCount ?? 0) + 1,
      });
    }
  },
});

export const failTask = internalMutation({
  args: {
    taskId: v.id("podcastClipperTasks"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      status: "failed",
      errorMessage: args.errorMessage,
      completedAt: Date.now(),
    });

    // If calibrate task failed, reset folder status
    if (task.type === "calibrate") {
      await ctx.db.patch(task.folderId, { calibrationStatus: "none" });
    }

    // If reframe task failed, reset video status
    if (task.type === "reframe" && task.targetVideoId) {
      await ctx.db.patch(task.targetVideoId, {
        status: "failed",
        errorMessage: args.errorMessage,
      });
    }
  },
});
