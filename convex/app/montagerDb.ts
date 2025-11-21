import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";

/**
 * Get all montager folders for the current user
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
      .query("montagerFolders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Get video counts and config status for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const videos = await ctx.db
          .query("montagerVideos")
          .withIndex("by_montagerFolderId", (q) => q.eq("montagerFolderId", folder._id))
          .collect();

        const configs = await ctx.db
          .query("montageConfigs")
          .withIndex("by_montagerFolderId", (q) => q.eq("montagerFolderId", folder._id))
          .collect();

        const pendingConfigs = configs.filter((c) => !c.isProcessed).length;

        return {
          ...folder,
          videoCount: videos.length,
          configCount: configs.length,
          pendingConfigs,
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
    folderId: v.id("montagerFolders"),
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
 * Get all videos in a montager folder
 */
export const getVideos = query({
  args: {
    folderId: v.id("montagerFolders"),
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
      .query("montagerVideos")
      .withIndex("by_montagerFolderId_isUsed", (q) => q.eq("montagerFolderId", args.folderId).eq("isUsed", false))
      .collect();

    return videos;
  },
});

/**
 * Get all configs for a montager folder
 */
export const getConfigs = query({
  args: {
    folderId: v.id("montagerFolders"),
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

    const configs = await ctx.db
      .query("montageConfigs")
      .withIndex("by_montagerFolderId", (q) => q.eq("montagerFolderId", args.folderId))
      .collect();

    return configs;
  },
});

/**
 * Create a new montager folder
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
      .query("montagerFolders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("folderName"), args.folderName))
      .first();

    if (existing) {
      throw new Error("Folder name already exists");
    }

    const folderId = await ctx.db.insert("montagerFolders", {
      userId: user._id,
      folderName: args.folderName,
    });

    return folderId;
  },
});

/**
 * Delete a montager folder and all its configs and videos
 */
export const deleteFolderDb = mutation({
  args: {
    folderId: v.id("montagerFolders"),
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

    // Delete all configs in the folder
    const configs = await ctx.db
      .query("montageConfigs")
      .withIndex("by_montagerFolderId", (q) => q.eq("montagerFolderId", args.folderId))
      .collect();

    for (const config of configs) {
      await ctx.db.delete(config._id);
    }

    // Delete all videos in the folder
    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_montagerFolderId", (q) => q.eq("montagerFolderId", args.folderId))
      .collect();

    for (const video of videos) {
      await ctx.db.delete(video._id);
    }

    // Delete the folder
    await ctx.db.delete(args.folderId);

    return { success: true, deletedConfigs: configs.length, deletedVideos: videos.length };
  },
});

/**
 * Create a new montage configuration
 * This creates a config that will be picked up by the external processing system
 */
export const createConfig = mutation({
  args: {
    folderId: v.id("montagerFolders"),
    clipperFolderIds: v.array(v.id("clipperFolders")),
    numberOfMontages: v.number(),
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

    // Verify montager folder belongs to user
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found");
    }

    // Validate clipper folders belong to user
    for (const clipperFolderId of args.clipperFolderIds) {
      const clipperFolder = await ctx.db.get(clipperFolderId);
      if (!clipperFolder || clipperFolder.userId !== user._id) {
        throw new Error("One or more clipper folders not found");
      }
    }

    // Validate numberOfMontages
    if (args.numberOfMontages < 1 || args.numberOfMontages > 1000) {
      throw new Error("Number of montages must be between 1 and 1000");
    }

    // Check that there are enough clips available
    let totalClips = 0;
    for (const clipperFolderId of args.clipperFolderIds) {
      const videos = await ctx.db
        .query("clippedVideoUrls")
        .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", clipperFolderId))
        .collect();

      for (const video of videos) {
        totalClips += video.outputUrls.filter((clip) => !clip.isDeleted).length;
      }
    }

    if (totalClips === 0) {
      throw new Error("No clips available in the selected folders");
    }

    const configId = await ctx.db.insert("montageConfigs", {
      montagerFolderId: args.folderId,
      clipperFolderIds: args.clipperFolderIds,
      numberOfMontages: args.numberOfMontages,
      isProcessed: false,
    });

    return { configId, totalClipsAvailable: totalClips };
  },
});

/**
 * Delete a video from montager folder
 */
export const deleteVideo = mutation({
  args: {
    videoId: v.id("montagerVideos"),
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

    const folder = await ctx.db.get(video.montagerFolderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.videoId);
    return { success: true };
  },
});

// =====================================================
// INTERNAL API FUNCTIONS (for HTTP endpoints)
// =====================================================

/**
 * Internal query to get all pending configs with randomly selected clips
 * Used by the external API endpoint GET /api/montager/pending
 */
export const getPendingConfigsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all unprocessed configs
    const pendingConfigs = await ctx.db
      .query("montageConfigs")
      .withIndex("by_isProcessed", (q) => q.eq("isProcessed", false))
      .collect();

    if (pendingConfigs.length === 0) {
      return [];
    }

    // Process each config
    const results = await Promise.all(
      pendingConfigs.map(async (config) => {
        // Get folder info
        const folder = await ctx.db.get(config.montagerFolderId);
        const folderName = folder?.folderName || "Unknown";

        // Gather all available clips from selected clipper folders
        const allClips: string[] = [];

        for (const clipperFolderId of config.clipperFolderIds) {
          const videos = await ctx.db
            .query("clippedVideoUrls")
            .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", clipperFolderId))
            .collect();

          for (const video of videos) {
            // Filter out deleted clips and add to pool
            const activeClips = video.outputUrls
              .filter((clip) => !clip.isDeleted)
              .map((clip) => clip.videoUrl);
            allClips.push(...activeClips);
          }
        }

        // Generate montages with random clip selection
        const CLIPS_PER_MONTAGE = 14;
        const montages: { clips: string[] }[] = [];

        for (let i = 0; i < config.numberOfMontages; i++) {
          const montageClips: string[] = [];

          // Randomly select 14 clips (with replacement allowed)
          for (let j = 0; j < CLIPS_PER_MONTAGE; j++) {
            if (allClips.length > 0) {
              const randomIndex = Math.floor(Math.random() * allClips.length);
              const clip = allClips[randomIndex];
              if (clip) {
                montageClips.push(clip);
              }
            }
          }

          montages.push({ clips: montageClips });
        }

        return {
          configId: config._id,
          montagerFolderId: config.montagerFolderId,
          folderName,
          clipperFolderIds: config.clipperFolderIds,
          numberOfMontages: config.numberOfMontages,
          totalClipsAvailable: allClips.length,
          montages,
        };
      })
    );

    return results;
  },
});

/**
 * Internal mutation to add videos and mark config as processed
 * Used by the external API endpoint POST /api/montager/update
 */
export const updateVideosExternal = internalMutation({
  args: {
    configId: v.id("montageConfigs"),
    videos: v.array(
      v.object({
        videoUrl: v.string(),
        thumbnailUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verify config exists
    const config = await ctx.db.get(args.configId);
    if (!config) {
      throw new Error(`Config not found: ${args.configId}`);
    }

    // Insert all videos
    const insertedIds = [];
    for (const video of args.videos) {
      const videoId = await ctx.db.insert("montagerVideos", {
        montagerFolderId: config.montagerFolderId,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        isUsed: false,
        isPublished: false,
      });
      insertedIds.push(videoId);
    }

    // Mark config as processed
    await ctx.db.patch(args.configId, {
      isProcessed: true,
    });

    return {
      success: true,
      configId: args.configId,
      videosAdded: insertedIds.length,
    };
  },
});
