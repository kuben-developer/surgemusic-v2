import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Sanitize input video name for use as URL path
 * - Lowercase
 * - Remove file extension
 * - Replace special chars with dashes
 * - Collapse multiple dashes
 * - Trim leading/trailing dashes
 */
function sanitizeInputVideoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')  // Remove extension
    .replace(/[^a-z0-9-_]/g, '-')  // Replace special chars with dash
    .replace(/-+/g, '-')  // Collapse multiple dashes
    .replace(/^-|-$/g, '');  // Trim leading/trailing dashes
}

/**
 * Get all folders for the current user
 * Returns folders with denormalized counts from the folder document itself.
 */
export const getFolders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const folders = await ctx.db
      .query("clipperFolders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Return folders with denormalized counts (stored on folder document)
    return folders.map((folder) => ({
      ...folder,
      videoCount: folder.videoCount ?? 0,
      clipCount: folder.clipCount ?? 0,
    }));
  },
});

/**
 * Get counts for a single folder
 * Reads from denormalized counts on folder document - very fast, no expensive queries
 */
export const getFolderCounts = query({
  args: {
    folderId: v.id("clipperFolders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { videoCount: 0, clipCount: 0 };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { videoCount: 0, clipCount: 0 };
    }

    // Just read the folder document - counts are denormalized
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      return { videoCount: 0, clipCount: 0 };
    }

    return {
      videoCount: folder.videoCount ?? 0,
      clipCount: folder.clipCount ?? 0,
    };
  },
});

/**
 * Get a single folder by ID
 */
export const getFolder = query({
  args: {
    folderId: v.id("clipperFolders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      return null;
    }

    return folder;
  },
});

/**
 * Get all videos in a folder
 */
export const getVideos = query({
  args: {
    folderId: v.id("clipperFolders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Verify folder belongs to user
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      return [];
    }

    const videos = await ctx.db
      .query("clippedVideoUrls")
      .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", args.folderId))
      .collect();

    // Return videos with limited outputUrls for preview (only first 3)
    // Include counts for display
    return videos.map((video) => ({
      ...video,
      totalClipCount: video.outputUrls.length,
      activeClipCount: video.outputUrls.filter((c) => !c.isDeleted).length,
      outputUrls: video.outputUrls.slice(0, 3),
    }));
  },
});

/**
 * Create a new folder (DB-based)
 */
export const createFolderDb = mutation({
  args: {
    folderName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate folder name
    if (!/^[a-zA-Z0-9_-]+$/.test(args.folderName)) {
      throw new Error("Folder name can only contain letters, numbers, hyphens, and underscores");
    }

    // Check if folder already exists for this user
    const existing = await ctx.db
      .query("clipperFolders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("folderName"), args.folderName))
      .first();

    if (existing) {
      throw new Error("Folder name already exists");
    }

    const folderId = await ctx.db.insert("clipperFolders", {
      userId: user._id,
      folderName: args.folderName,
      videoCount: 0,
      clipCount: 0,
    });

    return folderId;
  },
});

/**
 * Upload a video - creates DB record and schedules background processing
 * Sanitizes inputVideoName and checks for duplicates within the folder
 */
export const uploadVideo = mutation({
  args: {
    folderId: v.id("clipperFolders"),
    inputVideoName: v.string(),
    inputVideoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify folder belongs to user
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found");
    }

    // Sanitize the input video name for URL usage
    const sanitizedName = sanitizeInputVideoName(args.inputVideoName);

    if (!sanitizedName) {
      throw new Error("Invalid video name");
    }

    // Check for duplicate video name in this folder
    const existingVideo = await ctx.db
      .query("clippedVideoUrls")
      .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", args.folderId))
      .filter((q) => q.eq(q.field("inputVideoName"), sanitizedName))
      .first();

    if (existingVideo) {
      throw new Error(`A video with the name "${sanitizedName}" already exists in this folder`);
    }

    // Create the video record with sanitized name
    const videoId = await ctx.db.insert("clippedVideoUrls", {
      clipperFolderId: args.folderId,
      inputVideoName: sanitizedName,
      inputVideoUrl: args.inputVideoUrl,
      outputUrls: [], // Empty initially, will be populated by background job
      status: "pending",
    });

    // Increment videoCount on folder
    await ctx.db.patch(args.folderId, {
      videoCount: (folder.videoCount ?? 0) + 1,
    });

    return { videoId, sanitizedName };
  },
});

/**
 * Update video with output URLs (called by background job)
 * Includes all clip metadata: brightness, clarity, clipNumber, isDeleted
 * Also updates folder clipCount and video status
 */
export const updateVideoOutputs = internalMutation({
  args: {
    videoId: v.id("clippedVideoUrls"),
    outputUrls: v.array(v.object({
      videoUrl: v.string(),
      thumbnailUrl: v.string(),
      clipNumber: v.number(),
      brightness: v.number(),
      clarity: v.number(),
      isDeleted: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error(`Video not found: ${args.videoId}`);
    }

    // Calculate how many new active clips are being added
    const oldActiveClipCount = video.outputUrls.filter((c) => !c.isDeleted).length;
    const newActiveClipCount = args.outputUrls.filter((c) => !c.isDeleted).length;
    const clipCountDelta = newActiveClipCount - oldActiveClipCount;

    // Update the video
    await ctx.db.patch(args.videoId, {
      outputUrls: args.outputUrls,
      status: "processed",
    });

    // Update folder clipCount if changed
    if (clipCountDelta !== 0) {
      const folder = await ctx.db.get(video.clipperFolderId);
      if (folder) {
        await ctx.db.patch(video.clipperFolderId, {
          clipCount: Math.max(0, (folder.clipCount ?? 0) + clipCountDelta),
        });
      }
    }
  },
});

/**
 * Delete a video
 * Also decrements folder videoCount and clipCount
 */
export const deleteVideo = mutation({
  args: {
    videoId: v.id("clippedVideoUrls"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get video and verify ownership via folder
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    const folder = await ctx.db.get(video.clipperFolderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Calculate active clips being removed
    const activeClipCount = video.outputUrls.filter((c) => !c.isDeleted).length;

    await ctx.db.delete(args.videoId);

    // Decrement folder counts
    await ctx.db.patch(video.clipperFolderId, {
      videoCount: Math.max(0, (folder.videoCount ?? 0) - 1),
      clipCount: Math.max(0, (folder.clipCount ?? 0) - activeClipCount),
    });

    return { success: true };
  },
});

/**
 * Delete a folder and all its videos (DB-based)
 */
export const deleteFolderDb = mutation({
  args: {
    folderId: v.id("clipperFolders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found");
    }

    // Delete all videos in the folder
    const videos = await ctx.db
      .query("clippedVideoUrls")
      .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", args.folderId))
      .collect();

    for (const video of videos) {
      await ctx.db.delete(video._id);
    }

    // Delete the folder
    await ctx.db.delete(args.folderId);

    return { success: true, deletedVideos: videos.length };
  },
});

/**
 * Get a video by folder ID and sanitized input video name
 * Used for the clips page route
 */
export const getVideoByName = query({
  args: {
    folderId: v.id("clipperFolders"),
    inputVideoName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Verify folder belongs to user
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      return null;
    }

    // Find video by sanitized name
    const video = await ctx.db
      .query("clippedVideoUrls")
      .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", args.folderId))
      .filter((q) => q.eq(q.field("inputVideoName"), args.inputVideoName))
      .first();

    return video;
  },
});

/**
 * Soft delete clips by setting isDeleted to true
 * Takes an array of clip indices to delete
 * Also decrements folder clipCount
 */
export const softDeleteClips = mutation({
  args: {
    videoId: v.id("clippedVideoUrls"),
    clipIndices: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get video and verify ownership
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    const folder = await ctx.db.get(video.clipperFolderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Count how many active clips are being deleted
    let clipsDeleted = 0;
    const updatedOutputUrls = video.outputUrls.map((clip, index) => {
      if (args.clipIndices.includes(index) && !clip.isDeleted) {
        clipsDeleted++;
        return { ...clip, isDeleted: true };
      }
      return clip;
    });

    await ctx.db.patch(args.videoId, {
      outputUrls: updatedOutputUrls,
    });

    // Decrement folder clipCount
    if (clipsDeleted > 0) {
      await ctx.db.patch(video.clipperFolderId, {
        clipCount: Math.max(0, (folder.clipCount ?? 0) - clipsDeleted),
      });
    }

    return { success: true, deletedCount: clipsDeleted };
  },
});

/**
 * Restore soft-deleted clips
 * Also increments folder clipCount
 */
export const restoreClips = mutation({
  args: {
    videoId: v.id("clippedVideoUrls"),
    clipIndices: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    const folder = await ctx.db.get(video.clipperFolderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Count how many deleted clips are being restored
    let clipsRestored = 0;
    const updatedOutputUrls = video.outputUrls.map((clip, index) => {
      if (args.clipIndices.includes(index) && clip.isDeleted) {
        clipsRestored++;
        return { ...clip, isDeleted: false };
      }
      return clip;
    });

    await ctx.db.patch(args.videoId, {
      outputUrls: updatedOutputUrls,
    });

    // Increment folder clipCount
    if (clipsRestored > 0) {
      await ctx.db.patch(video.clipperFolderId, {
        clipCount: (folder.clipCount ?? 0) + clipsRestored,
      });
    }

    return { success: true, restoredCount: clipsRestored };
  },
});

// =====================================================
// INTERNAL API FUNCTIONS (for HTTP endpoints)
// =====================================================

/**
 * Internal query to get all videos with status "pending" (waiting for processing)
 * Used by the external API endpoint
 * Uses status index for efficient queries - no byte limit issues
 */
export const getPendingVideosInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Use the status index to efficiently get only pending videos
    // This avoids loading processed videos with large outputUrls arrays
    const pendingVideos = await ctx.db
      .query("clippedVideoUrls")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // For each pending video, get the folder info
    // Pending videos have empty outputUrls, so they're small documents
    const videosWithFolderInfo = await Promise.all(
      pendingVideos.map(async (video) => {
        const folder = await ctx.db.get(video.clipperFolderId);
        return {
          _id: video._id,
          clipperFolderId: video.clipperFolderId,
          folderName: folder?.folderName || "Unknown",
          inputVideoName: video.inputVideoName,
          inputVideoUrl: video.inputVideoUrl,
        };
      })
    );

    return videosWithFolderInfo;
  },
});

/**
 * Migration: Populate denormalized counts for a single clipper folder
 * Run for each folder to backfill videoCount and clipCount
 * Uses pagination to avoid byte limits
 */
export const migratePopulateSingleFolderCounts = internalMutation({
  args: {
    folderId: v.id("clipperFolders"),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      return { success: false, error: "Folder not found" };
    }

    let videoCount = 0;
    let clipCount = 0;
    let cursor: string | null = null;
    let hasMore = true;

    // Paginate through videos to avoid byte limits
    while (hasMore) {
      const result = await ctx.db
        .query("clippedVideoUrls")
        .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", args.folderId))
        .paginate({ cursor, numItems: 50 });

      for (const video of result.page) {
        videoCount++;
        // Count active (non-deleted) clips
        clipCount += video.outputUrls.filter((c) => !c.isDeleted).length;

        // Set status field if not already set
        if (video.status === undefined) {
          const hasOutputs = video.outputUrls.length > 0;
          await ctx.db.patch(video._id, {
            status: hasOutputs ? "processed" : "pending",
          });
        }
      }

      cursor = result.continueCursor;
      hasMore = !result.isDone;
    }

    // Update folder with calculated counts
    await ctx.db.patch(args.folderId, {
      videoCount,
      clipCount,
    });

    return { success: true, folderId: args.folderId, videoCount, clipCount };
  },
});

/**
 * Migration: Get all folder IDs for batch migration
 * Returns folder IDs that need to be migrated
 */
export const getMigrationFolderIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const folders = await ctx.db.query("clipperFolders").collect();
    return folders.map((f) => f._id);
  },
});

/**
 * Internal mutation to update video outputs from external API
 * Validates the video exists and updates outputUrls
 * Also updates status and folder clipCount
 */
export const updateVideoOutputsExternal = internalMutation({
  args: {
    videoId: v.id("clippedVideoUrls"),
    outputUrls: v.array(
      v.object({
        videoUrl: v.string(),
        thumbnailUrl: v.string(),
        clipNumber: v.number(),
        brightness: v.number(),
        clarity: v.number(),
        isDeleted: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verify video exists
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error(`Video not found: ${args.videoId}`);
    }

    // Normalize outputUrls - set isDeleted to false if not provided
    const normalizedOutputUrls = args.outputUrls.map((clip) => ({
      ...clip,
      isDeleted: clip.isDeleted ?? false,
    }));

    // Calculate clip count delta
    const oldActiveClipCount = video.outputUrls.filter((c) => !c.isDeleted).length;
    const newActiveClipCount = normalizedOutputUrls.filter((c) => !c.isDeleted).length;
    const clipCountDelta = newActiveClipCount - oldActiveClipCount;

    // Update the video with new outputUrls and status
    await ctx.db.patch(args.videoId, {
      outputUrls: normalizedOutputUrls,
      status: "processed",
    });

    // Update folder clipCount if changed
    if (clipCountDelta !== 0) {
      const folder = await ctx.db.get(video.clipperFolderId);
      if (folder) {
        await ctx.db.patch(video.clipperFolderId, {
          clipCount: Math.max(0, (folder.clipCount ?? 0) + clipCountDelta),
        });
      }
    }

    return {
      success: true,
      videoId: args.videoId,
      clipCount: normalizedOutputUrls.length,
    };
  },
});
