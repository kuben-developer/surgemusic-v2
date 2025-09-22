import { query, internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

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

export const updateStripeCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      billing: {
        ...user.billing,
        stripeCustomerId: args.stripeCustomerId,
      },
    });
  },
})

export const updateTrial = internalMutation({
  args: {
    userId: v.id("users"),
    isTrial: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      billing: {
        ...user.billing,
        isTrial: args.isTrial,
      },
    });
  },
})

export const updateUserFirstTimeAndTrial = internalMutation({
  args: {
    userId: v.id("users"),
    firstTimeUser: v.boolean(),
    isTrial: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      billing: {
        ...user.billing,
        firstTimeUser: args.firstTimeUser,
        isTrial: args.isTrial,
      },
    });
  },
})