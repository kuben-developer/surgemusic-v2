import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

/**
 * Generates a random UUID-like string
 * Using a simple implementation since crypto.randomUUID is not available in Convex
 */
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Add videos from montager folder to generatedVideos table
 */
export const addMontagerVideosToGenerated = mutation({
  args: {
    campaignId: v.string(),
    categoryName: v.string(),
    nicheName: v.string(),
    overlayStyle: v.string(),
    videos: v.array(
      v.object({
        key: v.string(),
        url: v.string(),
        filename: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { campaignId, categoryName, nicheName, overlayStyle, videos } = args;

    // Insert each video into the generatedVideos table
    const insertedIds = await Promise.all(
      videos.map(async (video) => {
        // Generate unique ID for each video using timestamp + random string
        const uniqueId = generateUniqueId();
        const generatedVideoId = `${campaignId}-${categoryName}-${nicheName}-${uniqueId}`;

        const id = await ctx.db.insert("generatedVideos", {
          generatedVideoId,
          campaignId,
          categoryName,
          nicheName,
          overlayStyle,
          videoUrl: video.url,
          sentToAirtable: false,
        });

        return id;
      })
    );

    return {
      success: true,
      count: insertedIds.length,
      ids: insertedIds,
    };
  },
});

/**
 * Query generated videos for a specific campaign, category, and niche
 * Filter for ready-to-publish videos (sentToAirtable=false && generatedVideoUrl exists)
 */
export const getReadyToPublishVideos = query({
  args: {
    campaignId: v.string(),
    categoryName: v.string(),
    nicheName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { campaignId, categoryName, nicheName } = args;

    // Return empty array if required fields are missing
    if (!campaignId || !categoryName) {
      return [];
    }

    try {
      // Use index for efficient querying - filters on campaignId, categoryName, sentToAirtable
      const videos = await ctx.db
        .query("generatedVideos")
        .withIndex("by_campaign_category", (q) =>
          q
            .eq("campaignId", campaignId)
            .eq("categoryName", categoryName)
            .eq("sentToAirtable", false)
        )
        .collect();

      // Filter for videos with generatedVideoUrl and optional niche in JavaScript
      // (These fields can't be indexed efficiently but dataset is already reduced by 90%+)
      return videos.filter((v) => {
        // Must have generatedVideoUrl (processed by external service)
        if (!v.generatedVideoUrl) return false;

        // If niche filter provided, must match
        if (nicheName && v.nicheName !== nicheName) return false;

        return true;
      });
    } catch (error) {
      console.error("Error fetching ready-to-publish videos:", error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },
});

/**
 * Query all generated videos for a campaign (for debugging/admin purposes)
 */
export const getAllGeneratedVideos = query({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generatedVideos")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .collect();
  },
});

/**
 * Update sentToAirtable status for a video
 */
export const markAsSentToAirtable = mutation({
  args: {
    videoId: v.id("generatedVideos"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.videoId, {
      sentToAirtable: true,
    });

    return { success: true };
  },
});

/**
 * Batch mark multiple videos as sent to Airtable
 */
export const batchMarkAsSentToAirtable = mutation({
  args: {
    videoIds: v.array(v.id("generatedVideos")),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.videoIds.map((id) =>
        ctx.db.patch(id, {
          sentToAirtable: true,
        })
      )
    );

    return {
      success: true,
      count: args.videoIds.length,
    };
  },
});
