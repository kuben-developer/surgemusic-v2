import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

/**
 * Get media data (audio and lyrics) for a campaign
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
      lyrics: assets.lyrics,
      wordsData: assets.wordsData,
      lyricsWithWords: assets.lyricsWithWords,
    };
  },
});

/**
 * Update audio and lyrics for a campaign
 */
export const updateAudioAndLyrics = mutation({
  args: {
    campaignId: v.string(),
    audioFileId: v.optional(v.id("_storage")),
    audioUrl: v.optional(v.string()),
    srtFileId: v.optional(v.id("_storage")),
    srtUrl: v.optional(v.string()),
    hasLyrics: v.optional(v.boolean()),
    lyrics: v.optional(
      v.array(
        v.object({
          timestamp: v.number(),
          text: v.string(),
        })
      )
    ),
    wordsData: v.optional(
      v.array(
        v.object({
          text: v.string(),
          start: v.number(),
          end: v.number(),
          type: v.string(),
          logprob: v.optional(v.number()),
        })
      )
    ),
    lyricsWithWords: v.optional(
      v.array(
        v.object({
          timestamp: v.number(),
          text: v.string(),
          wordIndices: v.array(v.number()),
        })
      )
    ),
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
 * Remove audio and lyrics from a campaign
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
 * Update only lyrics data (used after transcription/editing)
 */
export const updateLyrics = mutation({
  args: {
    campaignId: v.string(),
    srtFileId: v.optional(v.id("_storage")),
    srtUrl: v.optional(v.string()),
    lyrics: v.array(
      v.object({
        timestamp: v.number(),
        text: v.string(),
      })
    ),
    wordsData: v.optional(
      v.array(
        v.object({
          text: v.string(),
          start: v.number(),
          end: v.number(),
          type: v.string(),
          logprob: v.optional(v.number()),
        })
      )
    ),
    lyricsWithWords: v.optional(
      v.array(
        v.object({
          timestamp: v.number(),
          text: v.string(),
          wordIndices: v.array(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { campaignId, ...lyricsData } = args;

    const assets = await ctx.db
      .query("campaignAssets")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!assets) {
      return { success: false, error: "Campaign assets not found" };
    }

    await ctx.db.patch(assets._id, {
      hasLyrics: true,
      ...lyricsData,
    });

    return { success: true };
  },
});
