import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
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

    return {
      videoGenerationCredit: user.credits.videoGeneration,
      videoGenerationAdditionalCredit: user.credits.videoGenerationAdditional,
      subscriptionPriceId: user.billing.subscriptionPriceId,
      isTrial: user.billing.isTrial,
      firstTimeUser: user.billing.firstTimeUser,
    };
  },
});

export const getByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
})