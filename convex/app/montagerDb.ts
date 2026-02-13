import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

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
        // Only count pending videos (available to assign)
        const pendingVideos = await ctx.db
          .query("montagerVideos")
          .withIndex("by_montagerFolderId_status", (q) =>
            q.eq("montagerFolderId", folder._id).eq("status", "pending")
          )
          .collect();

        const configs = await ctx.db
          .query("montageConfigs")
          .withIndex("by_montagerFolderId", (q) => q.eq("montagerFolderId", folder._id))
          .collect();

        const pendingConfigs = configs.filter((c) => !c.isProcessed).length;

        return {
          ...folder,
          videoCount: pendingVideos.length,
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
      .withIndex("by_montagerFolderId_status", (q) => q.eq("montagerFolderId", args.folderId).eq("status", "pending"))
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

    // Only delete videos with status "pending" (unassigned videos)
    // Keep videos that have been assigned to airtable records
    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_montagerFolderId_status", (q) =>
        q.eq("montagerFolderId", args.folderId).eq("status", "pending")
      )
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

    // Get video and verify ownership
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    // For videos with a folder, verify via folder ownership
    // For direct uploads (no folder), any authenticated user can delete
    if (video.montagerFolderId) {
      const folder = await ctx.db.get(video.montagerFolderId);
      if (!folder || folder.userId !== user._id) {
        throw new Error("Unauthorized");
      }
    }

    await ctx.db.delete(args.videoId);
    return { success: true };
  },
});

/**
 * Assign montager videos to Airtable records
 * Updates first N pending videos with overlay style, airtable record IDs, scheduled dates, and campaign ID
 */
export const assignVideosToAirtable = mutation({
  args: {
    folderId: v.id("montagerFolders"),
    overlayStyle: v.string(),
    renderType: v.optional(v.string()), // "Both" | "LyricsOnly" | "CaptionOnly"
    airtableRecords: v.array(v.object({
      id: v.string(),
      date: v.optional(v.string()),
    })),
    campaignId: v.string(), // Airtable campaign ID for fetching assets
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

    const count = args.airtableRecords.length;

    // Get first N pending videos from the folder
    const pendingVideos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_montagerFolderId_status", (q) =>
        q.eq("montagerFolderId", args.folderId).eq("status", "pending")
      )
      .take(count);

    if (pendingVideos.length < count) {
      throw new Error(
        `Not enough pending videos in folder. Need ${count}, found ${pendingVideos.length}`
      );
    }

    // Update each video with the corresponding airtable record ID and scheduled date
    const updatedIds = [];
    for (let i = 0; i < count; i++) {
      const video = pendingVideos[i];
      const record = args.airtableRecords[i];

      if (video && record) {
        await ctx.db.patch(video._id, {
          status: "ready_for_processing",
          overlayStyle: args.overlayStyle,
          renderType: args.renderType ?? "Both",
          airtableRecordId: record.id,
          scheduledDate: record.date,
          campaignId: args.campaignId,
        });
        updatedIds.push(video._id);
      }
    }

    return {
      success: true,
      count: updatedIds.length,
      ids: updatedIds,
    };
  },
});

/**
 * Get count of pending videos in a folder
 */
export const getPendingVideoCount = query({
  args: {
    folderId: v.id("montagerFolders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return 0;
    }

    // Verify folder belongs to user
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== user._id) {
      return 0;
    }

    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_montagerFolderId_status", (q) =>
        q.eq("montagerFolderId", args.folderId).eq("status", "pending")
      )
      .collect();

    return videos.length;
  },
});

/**
 * Get all airtableRecordIds that have been assigned to montager videos for a specific campaign
 * Used to filter out records that already have videos assigned
 */
export const getAssignedAirtableRecordIds = query({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get montagerVideos for this campaign using the index
    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Filter for videos that have an airtableRecordId assigned and are not pending
    const assignedIds = videos
      .filter((video) => video.airtableRecordId && video.status !== "pending")
      .map((video) => video.airtableRecordId!);

    return assignedIds;
  },
});

/**
 * Get montager videos by campaign ID
 * Uses the by_campaignId index for efficient single-query lookup
 * Much more efficient than querying individual airtableRecordIds
 */
export const getMontagerVideosByCampaignId = query({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    // Single indexed query to get all videos for this campaign
    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const processing = videos.filter(
      (v) => v.status === "ready_for_processing"
    );
    const processed = videos.filter(
      (v) => v.status === "processed"
    );

    return { processing, processed };
  },
});

// =====================================================
// INTERNAL API FUNCTIONS (for HTTP endpoints)
// =====================================================

/**
 * Internal query to get all pending (unprocessed) config metadata.
 * Lightweight — does not read clips.
 */
export const getPendingConfigsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const pendingConfigs = await ctx.db
      .query("montageConfigs")
      .withIndex("by_isProcessed", (q) => q.eq("isProcessed", false))
      .collect();

    const results = [];
    for (const config of pendingConfigs) {
      const folder = await ctx.db.get(config.montagerFolderId);
      results.push({
        configId: config._id,
        montagerFolderId: config.montagerFolderId,
        folderName: folder?.folderName || "Unknown",
        clipperFolderIds: config.clipperFolderIds,
        numberOfMontages: config.numberOfMontages,
      });
    }
    return results;
  },
});

/**
 * Internal query to get clip URLs for a single clipper folder.
 * Each call gets its own 16MB read budget.
 */
export const getClipUrlsForFolder = internalQuery({
  args: { clipperFolderId: v.id("clipperFolders"), maxClips: v.number() },
  handler: async (ctx, { clipperFolderId, maxClips }) => {
    const clips: string[] = [];
    let isDone = false;
    let cursor: string | null = null;

    // Read in small batches and stop once we have enough clips
    while (!isDone && clips.length < maxClips) {
      const page = await ctx.db
        .query("clippedVideoUrls")
        .withIndex("by_clipperFolderId", (q) => q.eq("clipperFolderId", clipperFolderId))
        .paginate({ numItems: 20, cursor: cursor === null ? null : cursor });

      for (const video of page.page) {
        for (const clip of video.outputUrls) {
          if (!clip.isDeleted) {
            clips.push(clip.videoUrl);
            if (clips.length >= maxClips) break;
          }
        }
        if (clips.length >= maxClips) break;
      }

      isDone = page.isDone;
      cursor = page.continueCursor;
    }

    return clips;
  },
});

/**
 * Internal action to build pending configs with randomly selected clips.
 * Uses separate query calls per folder so each stays under the 16MB read limit.
 * Used by the external API endpoint GET /api/montager/pending
 */
export const buildPendingConfigsWithClips = internalAction({
  args: {},
  handler: async (ctx): Promise<Array<{
    configId: Id<"montageConfigs">;
    montagerFolderId: Id<"montagerFolders">;
    folderName: string;
    clipperFolderIds: Id<"clipperFolders">[];
    numberOfMontages: number;
    totalClipsAvailable: number;
    montages: { clips: string[] }[];
  }>> => {
    const configs = await ctx.runQuery(
      internal.app.montagerDb.getPendingConfigsInternal
    );

    if (configs.length === 0) return [];

    const CLIPS_PER_MONTAGE = 14;
    const results = [];

    for (const config of configs) {
      const clipsNeeded = config.numberOfMontages * CLIPS_PER_MONTAGE;
      const clipsPerFolder = Math.max(
        100,
        Math.ceil(clipsNeeded / Math.max(1, config.clipperFolderIds.length))
      );

      // Fetch clips from each folder in a separate query call
      const allClips: string[] = [];
      for (const clipperFolderId of config.clipperFolderIds) {
        const folderClips = await ctx.runQuery(
          internal.app.montagerDb.getClipUrlsForFolder,
          { clipperFolderId, maxClips: clipsPerFolder }
        );
        allClips.push(...folderClips);
      }

      // Generate montages with random clip selection
      const montages: { clips: string[] }[] = [];
      for (let i = 0; i < config.numberOfMontages; i++) {
        const montageClips: string[] = [];
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

      results.push({
        configId: config.configId,
        montagerFolderId: config.montagerFolderId,
        folderName: config.folderName,
        clipperFolderIds: config.clipperFolderIds,
        numberOfMontages: config.numberOfMontages,
        totalClipsAvailable: allClips.length,
        montages,
      });
    }

    return results;
  },
});

/**
 * Internal query to get all videos ready for processing (with overlay)
 * Used by the external API endpoint GET /api/montager-videos/pending
 * Includes campaign assets (audioUrl, srtUrl) and captions for overlay processing
 */
export const getPendingVideosForProcessingInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get all videos with status "ready_for_processing"
    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_status", (q) => q.eq("status", "ready_for_processing"))
      .collect();

    // Group videos by campaignId to batch fetch campaign data
    const campaignIds = [...new Set(videos.map((v) => v.campaignId).filter(Boolean))] as string[];

    // Fetch campaign assets for all campaigns
    const campaignAssetsMap = new Map<string, { audioUrl?: string; srtUrl?: string }>();
    for (const campaignId of campaignIds) {
      const assets = await ctx.db
        .query("campaignAssets")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .first();

      if (assets) {
        campaignAssetsMap.set(campaignId, {
          audioUrl: assets.audioUrl,
          srtUrl: assets.srtUrl,
        });
      }
    }

    // Fetch captions for all campaigns
    const campaignCaptionsMap = new Map<string, string[]>();
    for (const campaignId of campaignIds) {
      const captions = await ctx.db
        .query("captions")
        .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
        .collect();

      campaignCaptionsMap.set(
        campaignId,
        captions.map((c) => c.text)
      );
    }

    return videos.map((video) => {
      const campaignId = video.campaignId;
      const assets = campaignId ? campaignAssetsMap.get(campaignId) : undefined;
      const captions = campaignId ? campaignCaptionsMap.get(campaignId) : undefined;

      return {
        videoId: video._id,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        overlayStyle: video.overlayStyle,
        renderType: video.renderType ?? "Both",
        airtableRecordId: video.airtableRecordId,
        campaignId: video.campaignId,
        // Campaign assets
        audioUrl: assets?.audioUrl,
        srtUrl: assets?.srtUrl,
        // Captions
        captions: captions ?? [],
      };
    });
  },
});

/**
 * Internal mutation to update processed video URL and status
 * Used by the external API endpoint POST /api/montager-videos/update
 */
export const updateProcessedVideoExternal = internalMutation({
  args: {
    videoId: v.id("montagerVideos"),
    processedVideoUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify video exists
    const video = await ctx.db.get(args.videoId);
    if (!video) {
      throw new Error(`Video not found: ${args.videoId}`);
    }

    // Only allow updating videos that are ready_for_processing
    if (video.status !== "ready_for_processing") {
      throw new Error(
        `Video ${args.videoId} is not ready for processing. Current status: ${video.status}`
      );
    }

    // Update the video with processed URL and status
    await ctx.db.patch(args.videoId, {
      processedVideoUrl: args.processedVideoUrl,
      status: "processed",
      ...(args.thumbnailUrl && { thumbnailUrl: args.thumbnailUrl }),
      ...(args.caption && { caption: args.caption }),
    });

    return {
      success: true,
      videoId: args.videoId,
    };
  },
});

/**
 * Unassign videos from Airtable records and return them to pending status
 * Used when users want to regenerate videos with different content
 */
export const unassignVideosFromAirtable = mutation({
  args: {
    videoIds: v.array(v.id("montagerVideos")),
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

    if (args.videoIds.length === 0) {
      return { success: true, count: 0 };
    }

    let unassignedCount = 0;

    for (const videoId of args.videoIds) {
      const video = await ctx.db.get(videoId);
      if (!video) {
        continue;
      }

      // For videos with a folder, verify via folder ownership
      // For direct uploads (no folder), any authenticated user can unassign
      if (video.montagerFolderId) {
        const folder = await ctx.db.get(video.montagerFolderId);
        if (!folder || folder.userId !== user._id) {
          continue;
        }
      }

      // Only unassign processed videos
      if (video.status !== "processed") {
        continue;
      }

      // For direct uploads, delete the video instead of resetting to pending
      // (they have no folder to return to)
      if (!video.montagerFolderId) {
        await ctx.db.delete(videoId);
        unassignedCount++;
        continue;
      }

      // Reset video to pending status
      await ctx.db.patch(videoId, {
        status: "pending",
        overlayStyle: undefined,
        renderType: undefined,
        airtableRecordId: undefined,
        campaignId: undefined,
        processedVideoUrl: undefined,
        scheduledDate: undefined,
      });

      unassignedCount++;
    }

    return {
      success: true,
      count: unassignedCount,
    };
  },
});

/**
 * Unassign all videos for a specific campaign ID
 * Used when users want to regenerate all videos for a campaign
 */
export const unassignVideosByCampaignId = mutation({
  args: {
    campaignId: v.string(),
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

    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    if (videos.length === 0) {
      return { success: true, count: 0 };
    }

    let unassignedCount = 0;

    for (const video of videos) {
      // For videos with a folder, verify via folder ownership
      if (video.montagerFolderId) {
        const folder = await ctx.db.get(video.montagerFolderId);
        if (!folder || folder.userId !== user._id) {
          continue;
        }
      }

      // Only unassign processed videos
      if (video.status !== "processed") {
        continue;
      }

      // For direct uploads (no folder), delete the video
      if (!video.montagerFolderId) {
        await ctx.db.delete(video._id);
        unassignedCount++;
        continue;
      }

      // Reset video to pending status
      await ctx.db.patch(video._id, {
        status: "pending",
        overlayStyle: undefined,
        renderType: undefined,
        airtableRecordId: undefined,
        campaignId: undefined,
        processedVideoUrl: undefined,
        scheduledDate: undefined,
      });

      unassignedCount++;
    }

    return {
      success: true,
      count: unassignedCount,
    };
  },
});

/**
 * Cancel all processing videos for a specific campaign ID
 * Used when users want to cancel videos that are still being processed
 */
export const cancelProcessingVideosByCampaignId = mutation({
  args: {
    campaignId: v.string(),
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

    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    if (videos.length === 0) {
      return { success: true, count: 0 };
    }

    let cancelledCount = 0;

    for (const video of videos) {
      // For videos with a folder, verify via folder ownership
      if (video.montagerFolderId) {
        const folder = await ctx.db.get(video.montagerFolderId);
        if (!folder || folder.userId !== user._id) {
          continue;
        }
      }

      // Only cancel processing videos (ready_for_processing status)
      if (video.status !== "ready_for_processing") {
        continue;
      }

      // For direct uploads (no folder), delete the video
      if (!video.montagerFolderId) {
        await ctx.db.delete(video._id);
        cancelledCount++;
        continue;
      }

      // Reset video to pending status
      await ctx.db.patch(video._id, {
        status: "pending",
        overlayStyle: undefined,
        renderType: undefined,
        airtableRecordId: undefined,
        campaignId: undefined,
        scheduledDate: undefined,
      });

      cancelledCount++;
    }

    return {
      success: true,
      count: cancelledCount,
    };
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
        status: "pending",
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

/**
 * Bulk create montager videos from direct uploads
 * Creates videos in "processed" state directly for Ready to Publish
 * Randomly assigns videos to provided Airtable record IDs
 */
export const bulkCreateDirectUploadVideos = mutation({
  args: {
    videoUrls: v.array(v.string()),
    campaignId: v.string(),
    unassignedRecordIds: v.array(v.string()),
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

    const { videoUrls, unassignedRecordIds, campaignId } = args;

    if (videoUrls.length === 0) {
      return { success: true, count: 0, ids: [] };
    }

    if (videoUrls.length > unassignedRecordIds.length) {
      throw new Error(
        `Not enough unassigned Airtable records. Have ${unassignedRecordIds.length}, need ${videoUrls.length}`
      );
    }

    // Shuffle record IDs for random assignment
    const shuffledRecordIds = [...unassignedRecordIds].sort(() => Math.random() - 0.5);

    const createdIds = [];
    let videoIndex = 0;

    for (const airtableRecordId of shuffledRecordIds) {
      if (videoIndex >= videoUrls.length) break;

      // Check if this airtableRecordId is already assigned to prevent duplicates
      const existingVideo = await ctx.db
        .query("montagerVideos")
        .withIndex("by_airtableRecordId", (q) => q.eq("airtableRecordId", airtableRecordId))
        .first();

      if (existingVideo) {
        // Skip this record ID, it's already assigned
        continue;
      }

      const videoUrl = videoUrls[videoIndex];
      if (!videoUrl) {
        videoIndex++;
        continue;
      }

      const videoId = await ctx.db.insert("montagerVideos", {
        montagerFolderId: undefined, // Direct upload - no folder
        videoUrl: videoUrl,
        thumbnailUrl: "direct_upload", // Placeholder
        processedVideoUrl: videoUrl, // Already processed
        status: "processed",
        airtableRecordId: airtableRecordId,
        campaignId: campaignId,
      });

      createdIds.push(videoId);
      videoIndex++;
    }

    // Warn if not all videos were assigned due to duplicates
    if (createdIds.length < videoUrls.length) {
      console.warn(
        `Only ${createdIds.length} of ${videoUrls.length} videos were assigned due to already-assigned records`
      );
    }

    return {
      success: true,
      count: createdIds.length,
      ids: createdIds,
    };
  },
});

/**
 * Upload videos directly to a montager folder
 * Used for manually uploading already-created montages
 */
export const uploadVideosToFolder = mutation({
  args: {
    folderId: v.id("montagerFolders"),
    videoUrls: v.array(v.string()),
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

    const { folderId, videoUrls } = args;

    if (videoUrls.length === 0) {
      return { success: true, count: 0, ids: [] };
    }

    const createdIds = [];
    for (const videoUrl of videoUrls) {
      if (!videoUrl) continue;

      const videoId = await ctx.db.insert("montagerVideos", {
        montagerFolderId: folderId,
        videoUrl: videoUrl,
        thumbnailUrl: "manual_upload", // Placeholder for manually uploaded videos
        status: "pending",
      });

      createdIds.push(videoId);
    }

    return {
      success: true,
      count: createdIds.length,
      ids: createdIds,
    };
  },
});

// =====================================================
// AIRTABLE PUBLISH FUNCTIONS
// =====================================================

/**
 * Internal query to get videos by their IDs
 * Used by publishVideosToAirtable action
 */
export const getVideosByIds = internalQuery({
  args: {
    videoIds: v.array(v.id("montagerVideos")),
  },
  handler: async (ctx, args) => {
    const videos = await Promise.all(
      args.videoIds.map(async (videoId) => {
        const video = await ctx.db.get(videoId);
        if (!video) return null;

        let folderName: string | undefined;
        if (video.montagerFolderId) {
          const folder = await ctx.db.get(video.montagerFolderId);
          folderName = folder?.folderName;
        }

        return { ...video, folderName };
      })
    );
    return videos.filter((v) => v !== null);
  },
});

/**
 * Internal mutation to mark videos as published
 * Used by publishVideosToAirtable action after successful Airtable update
 */
export const markVideosAsPublished = internalMutation({
  args: {
    videoIds: v.array(v.id("montagerVideos")),
  },
  handler: async (ctx, args) => {
    let updatedCount = 0;
    for (const videoId of args.videoIds) {
      const video = await ctx.db.get(videoId);
      if (video && video.status === "processed") {
        await ctx.db.patch(videoId, { status: "published" });
        updatedCount++;
      }
    }
    return { updatedCount };
  },
});

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const AIRTABLE_CONTENT_TABLE_ID = "tbleqHUKb7il998rO";

/**
 * Helper function to update an Airtable record with arbitrary fields
 */
async function updateAirtableRecord(
  recordId: string,
  fields: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTENT_TABLE_ID}/${recordId}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable update failed for ${recordId}: ${response.status} - ${errorText}`);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    console.error(`Error updating Airtable record ${recordId}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Publish processed videos to Airtable
 * Updates video_url, thumbnail_url, and status fields in Airtable Content table
 * Then marks videos as "published" in local database
 */
export const publishVideosToAirtable = action({
  args: {
    videoIds: v.array(v.id("montagerVideos")),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    published: number;
    failed: number;
    skipped: number;
  }> => {
    if (args.videoIds.length === 0) {
      return { success: true, published: 0, failed: 0, skipped: 0 };
    }

    // Fetch videos from database
    const videos = await ctx.runQuery(internal.app.montagerDb.getVideosByIds, {
      videoIds: args.videoIds,
    });

    let published = 0;
    let failed = 0;
    let skipped = 0;
    const publishedVideoIds: typeof args.videoIds = [];

    // Process each video
    for (const video of videos) {
      // Skip videos without airtableRecordId
      if (!video.airtableRecordId) {
        console.log(`Skipping video ${video._id} - no airtableRecordId`);
        skipped++;
        continue;
      }

      // Skip videos that are not in "processed" status
      if (video.status !== "processed") {
        console.log(`Skipping video ${video._id} - status is ${video.status}, not processed`);
        skipped++;
        continue;
      }

      // Use processedVideoUrl if available, otherwise fall back to videoUrl
      const videoUrl = video.processedVideoUrl || video.videoUrl;

      // Get thumbnail URL (skip placeholder values)
      const thumbnailUrl = video.thumbnailUrl &&
        video.thumbnailUrl !== "manual_upload" &&
        video.thumbnailUrl !== "direct_upload"
          ? video.thumbnailUrl
          : undefined;

      // Build fields object for Airtable update
      const fields: Record<string, string> = {
        video_url: videoUrl,
        status: "done",
      };
      if (thumbnailUrl) fields.thumbnail_url = thumbnailUrl;
      if (video.folderName) fields.video_bucket = video.folderName;

      // Update Airtable record
      const result = await updateAirtableRecord(video.airtableRecordId, fields);

      if (result.success) {
        published++;
        publishedVideoIds.push(video._id);
        console.log(`✓ Published video ${video._id} to Airtable record ${video.airtableRecordId}`);
      } else {
        failed++;
        console.error(`✗ Failed to publish video ${video._id}: ${result.error}`);
      }

      // Rate limiting: wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Mark successfully published videos as "published" in local database
    if (publishedVideoIds.length > 0) {
      await ctx.runMutation(internal.app.montagerDb.markVideosAsPublished, {
        videoIds: publishedVideoIds,
      });
    }

    console.log(`Publish complete: ${published} published, ${failed} failed, ${skipped} skipped`);

    return {
      success: failed === 0,
      published,
      failed,
      skipped,
    };
  },
});

// =====================================================
// AIRTABLE BACKFILL FUNCTIONS
// =====================================================

/**
 * Internal query to get backfill records, optionally filtered by campaign ID
 * Each chunk re-queries to avoid passing large arrays between scheduled actions
 */
export const getBackfillRecords = internalQuery({
  args: {
    campaignId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const videos = args.campaignId
      ? await ctx.db
          .query("montagerVideos")
          .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
          .collect()
      : await ctx.db.query("montagerVideos").collect();

    const results: { airtableRecordId: string; folderName: string }[] = [];

    for (const video of videos) {
      if (!video.airtableRecordId || !video.montagerFolderId) continue;

      const folder = await ctx.db.get(video.montagerFolderId);
      if (!folder?.folderName) continue;

      results.push({
        airtableRecordId: video.airtableRecordId,
        folderName: folder.folderName,
      });
    }

    return results;
  },
});

/**
 * Chunked internal action to backfill video_bucket in Airtable records
 * Each invocation re-queries for its chunk to avoid passing large arrays as args
 * Self-schedules the next chunk until all records are processed
 */
export const backfillAirtableVideoBuckets = internalAction({
  args: {
    campaignId: v.optional(v.string()),
    offset: v.number(),
    total: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const CHUNK_SIZE = 50;

    // Re-query to get records for this chunk
    const allRecords = await ctx.runQuery(
      internal.app.montagerDb.getBackfillRecords,
      { campaignId: args.campaignId }
    );

    const total = args.total ?? allRecords.length;
    const chunk = allRecords.slice(args.offset, args.offset + CHUNK_SIZE);

    if (chunk.length === 0) {
      console.log(`Backfill complete. Processed all ${total} records.`);
      return;
    }

    console.log(
      `Backfill: processing records ${args.offset + 1}-${args.offset + chunk.length} of ${total}`
    );

    let successCount = 0;
    let failCount = 0;

    for (const record of chunk) {
      const result = await updateAirtableRecord(record.airtableRecordId, {
        video_bucket: record.folderName,
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
        console.error(
          `Backfill failed for ${record.airtableRecordId}: ${result.error}`
        );
      }

      // Rate limiting: wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `Backfill chunk done: ${successCount} success, ${failCount} failed`
    );

    // Schedule next chunk if there are more records
    const nextOffset = args.offset + CHUNK_SIZE;
    if (nextOffset < total) {
      await ctx.scheduler.runAfter(0, internal.app.montagerDb.backfillAirtableVideoBuckets, {
        campaignId: args.campaignId,
        offset: nextOffset,
        total,
      });
    } else {
      console.log(`Backfill complete. Processed all ${total} records.`);
    }
  },
});

/**
 * Start backfill for a specific campaign
 * Run via: npx convex run app/montagerDb:startAirtableBackfillByCampaign '{"campaignId":"rec..."}'
 */
export const startAirtableBackfillByCampaign = internalAction({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.runQuery(
      internal.app.montagerDb.getBackfillRecords,
      { campaignId: args.campaignId }
    );

    if (records.length === 0) {
      console.log(`No records to backfill for campaign ${args.campaignId}.`);
      return;
    }

    console.log(`Starting backfill for ${records.length} records in campaign ${args.campaignId}...`);

    await ctx.scheduler.runAfter(0, internal.app.montagerDb.backfillAirtableVideoBuckets, {
      campaignId: args.campaignId,
      offset: 0,
      total: records.length,
    });
  },
});

/**
 * Start backfill for ALL records
 * Run via: npx convex run app/montagerDb:startAirtableBackfill
 */
export const startAirtableBackfill = internalAction({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.runQuery(
      internal.app.montagerDb.getBackfillRecords,
      {}
    );

    if (records.length === 0) {
      console.log("No records to backfill.");
      return;
    }

    console.log(`Starting backfill for ${records.length} records...`);

    await ctx.scheduler.runAfter(0, internal.app.montagerDb.backfillAirtableVideoBuckets, {
      offset: 0,
      total: records.length,
    });
  },
});
