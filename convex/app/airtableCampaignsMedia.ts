import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Get media data (audio and lyrics) for an airtable campaign
 */
export const getMediaData = query({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("airtableCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .first();

    if (!campaign) {
      return null;
    }

    return {
      audioFileId: campaign.audioFileId,
      audioUrl: campaign.audioUrl,
      hasLyrics: campaign.hasLyrics ?? false,
      lyrics: campaign.lyrics,
      wordsData: campaign.wordsData,
      lyricsWithWords: campaign.lyricsWithWords,
    };
  },
});

/**
 * Update audio and lyrics for an airtable campaign
 */
export const updateAudioAndLyrics = mutation({
  args: {
    campaignId: v.string(),
    audioFileId: v.optional(v.id("_storage")),
    audioUrl: v.optional(v.string()),
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

    // Find existing campaign record
    const existingCampaign = await ctx.db
      .query("airtableCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (existingCampaign) {
      // Update existing record
      await ctx.db.patch(existingCampaign._id, updateData);
      return { success: true, updated: true };
    } else {
      // Create new record with metadata defaults
      await ctx.db.insert("airtableCampaigns", {
        campaignId,
        metadata: {
          posted: 0,
          noPostId: 0,
          noVideoUrl: 0,
          scheduled: 0,
          errors: [],
        },
        ...updateData,
      });
      return { success: true, created: true };
    }
  },
});

/**
 * Remove audio and lyrics from an airtable campaign
 */
export const removeAudioAndLyrics = mutation({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("airtableCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .first();

    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    // Clear audio and lyrics fields
    await ctx.db.patch(campaign._id, {
      audioFileId: undefined,
      audioUrl: undefined,
      hasLyrics: undefined,
      lyrics: undefined,
      wordsData: undefined,
      lyricsWithWords: undefined,
    });

    return { success: true };
  },
});

/**
 * Update only lyrics data (used after transcription/editing)
 */
export const updateLyrics = mutation({
  args: {
    campaignId: v.string(),
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

    const campaign = await ctx.db
      .query("airtableCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    await ctx.db.patch(campaign._id, {
      hasLyrics: true,
      ...lyricsData,
    });

    return { success: true };
  },
});
