import { v } from "convex/values";
import { mutation, query, internalQuery } from "../_generated/server";

/**
 * Get media data (audio and SRT) for a campaign
 */
export const getMediaData = query({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("campaignAssets")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .first();

    if (!assets) {
      return null;
    }

    return {
      audioFileId: assets.audioFileId,
      audioUrl: assets.audioUrl,
      srtFileId: assets.srtFileId,
      srtUrl: assets.srtUrl,
      hasLyrics: assets.hasLyrics ?? false,
    };
  },
});

/**
 * Update audio and SRT for a campaign
 */
export const updateAudioAndLyrics = mutation({
  args: {
    campaignId: v.string(),
    audioFileId: v.optional(v.id("_storage")),
    audioUrl: v.optional(v.string()),
    srtFileId: v.optional(v.id("_storage")),
    srtUrl: v.optional(v.string()),
    hasLyrics: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { campaignId, ...updateData } = args;

    // Find existing assets record
    const existingAssets = await ctx.db
      .query("campaignAssets")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (existingAssets) {
      // Update existing record
      await ctx.db.patch(existingAssets._id, updateData);
      return { success: true, updated: true };
    } else {
      // Create new assets record
      await ctx.db.insert("campaignAssets", {
        campaignId,
        ...updateData,
      });
      return { success: true, created: true };
    }
  },
});

/**
 * Remove audio and SRT from a campaign
 */
export const removeAudioAndLyrics = mutation({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("campaignAssets")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .first();

    if (!assets) {
      return { success: false, error: "Campaign assets not found" };
    }

    // Delete the assets record
    await ctx.db.delete(assets._id);

    return { success: true };
  },
});

/**
 * Update only SRT data (used after SRT upload)
 */
export const updateLyrics = mutation({
  args: {
    campaignId: v.string(),
    srtFileId: v.optional(v.id("_storage")),
    srtUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { campaignId, ...srtData } = args;

    const assets = await ctx.db
      .query("campaignAssets")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!assets) {
      // Create new assets record if it doesn't exist
      await ctx.db.insert("campaignAssets", {
        campaignId,
        hasLyrics: true,
        ...srtData,
      });
      return { success: true, created: true };
    }

    await ctx.db.patch(assets._id, {
      hasLyrics: true,
      ...srtData,
    });

    return { success: true };
  },
});

/**
 * Remove only SRT data from a campaign (keeps audio intact)
 */
export const removeLyrics = mutation({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("campaignAssets")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .first();

    if (!assets) {
      return { success: false, error: "Campaign assets not found" };
    }

    // Clear only SRT related fields, keep audio intact
    await ctx.db.patch(assets._id, {
      hasLyrics: false,
      srtFileId: undefined,
      srtUrl: undefined,
    });

    return { success: true };
  },
});

/**
 * INTERNAL: Get campaign assets by campaignId
 * Used by webhook endpoints to fetch campaign data
 */
export const getAssetsByCampaignIdInternal = internalQuery({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("campaignAssets")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .first();

    return assets;
  },
});
