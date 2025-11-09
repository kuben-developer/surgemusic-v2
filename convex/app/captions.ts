import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

/**
 * List all captions for a campaign
 */
export const list = query({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const captions = await ctx.db
      .query("captions")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    return captions;
  },
});

/**
 * Add a single caption
 */
export const add = mutation({
  args: {
    campaignId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const captionId = await ctx.db.insert("captions", {
      campaignId: args.campaignId,
      text: args.text.trim(),
    });

    return captionId;
  },
});

/**
 * Bulk add captions from file upload
 */
export const bulkAdd = mutation({
  args: {
    campaignId: v.string(),
    captions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const captionIds = [];

    for (const text of args.captions) {
      const trimmedText = text.trim();
      if (trimmedText) {
        const id = await ctx.db.insert("captions", {
          campaignId: args.campaignId,
          text: trimmedText,
        });
        captionIds.push(id);
      }
    }

    return {
      count: captionIds.length,
      ids: captionIds,
    };
  },
});

/**
 * Remove a caption
 */
export const remove = mutation({
  args: {
    id: v.id("captions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Get total count of captions for a campaign
 */
export const count = query({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    const captions = await ctx.db
      .query("captions")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    return captions.length;
  },
});
