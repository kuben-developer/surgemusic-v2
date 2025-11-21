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

    // Get video counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const videos = await ctx.db
          .query("clippedVideoUrls")
          .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", folder._id))
          .collect();

        return {
          ...folder,
          videoCount: videos.length,
          clipCount: videos.reduce((acc, v) => acc + v.outputUrls.length, 0),
        };
      })
    );

    return foldersWithCounts;
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
    });

    return { videoId, sanitizedName };
  },
});

/**
 * Update video with output URLs (called by background job)
 * Includes all clip metadata: brightness, clarity, clipNumber, isDeleted
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
    await ctx.db.patch(args.videoId, {
      outputUrls: args.outputUrls,
    });
  },
});

/**
 * Delete a video
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

    await ctx.db.delete(args.videoId);
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

    // Update outputUrls to mark specified clips as deleted
    const updatedOutputUrls = video.outputUrls.map((clip, index) => {
      if (args.clipIndices.includes(index)) {
        return { ...clip, isDeleted: true };
      }
      return clip;
    });

    await ctx.db.patch(args.videoId, {
      outputUrls: updatedOutputUrls,
    });

    return { success: true, deletedCount: args.clipIndices.length };
  },
});

/**
 * Restore soft-deleted clips
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

    const updatedOutputUrls = video.outputUrls.map((clip, index) => {
      if (args.clipIndices.includes(index)) {
        return { ...clip, isDeleted: false };
      }
      return clip;
    });

    await ctx.db.patch(args.videoId, {
      outputUrls: updatedOutputUrls,
    });

    return { success: true, restoredCount: args.clipIndices.length };
  },
});

// =====================================================
// INTERNAL API FUNCTIONS (for HTTP endpoints)
// =====================================================

/**
 * Internal query to get all videos with empty outputUrls (pending processing)
 * Used by the external API endpoint
 */
export const getPendingVideosInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all clippedVideoUrls where outputUrls is empty
    const allVideos = await ctx.db.query("clippedVideoUrls").collect();

    // Filter to only pending videos (empty outputUrls array)
    const pendingVideos = allVideos.filter(
      (video) => video.outputUrls.length === 0
    );

    // For each video, get the folder info
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
 * Internal mutation to update video outputs from external API
 * Validates the video exists and updates outputUrls
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

    // Update the video with new outputUrls
    await ctx.db.patch(args.videoId, {
      outputUrls: normalizedOutputUrls,
    });

    return {
      success: true,
      videoId: args.videoId,
      clipCount: normalizedOutputUrls.length,
    };
  },
});
