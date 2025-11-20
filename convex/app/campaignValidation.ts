import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Validates if a campaign has all required assets for video generation
 * Checks for: audioUrl, srtUrl, and at least 1 caption
 */
export const validateCampaignAssets = query({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check campaignAssets for audioUrl and srtUrl
    const campaignAssets = await ctx.db
      .query("campaignAssets")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .first();

    const hasAudioUrl = !!campaignAssets?.audioUrl;
    const hasSrtUrl = !!campaignAssets?.srtUrl;

    // Check captions table for at least 1 caption
    const captions = await ctx.db
      .query("captions")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const hasCaptions = captions.length > 0;

    const missingRequirements: string[] = [];
    if (!hasAudioUrl) missingRequirements.push("Audio file");
    if (!hasSrtUrl) missingRequirements.push("SRT file");
    if (!hasCaptions) missingRequirements.push("At least 1 caption");

    return {
      isValid: hasAudioUrl && hasSrtUrl && hasCaptions,
      hasAudioUrl,
      hasSrtUrl,
      hasCaptions,
      captionsCount: captions.length,
      missingRequirements,
    };
  },
});
