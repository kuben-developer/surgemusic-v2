import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, query } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";


export const getPostCountsByDate = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }): Promise<Record<string, number>> => {
    // Get all posts for this campaign
    const bundlePosts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const airtablePosts = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Only include bundlePosts that have a matching postId in airtablePosts
    const airtablePostIds = new Set(airtablePosts.map((item) => item.postId));
    const posts = bundlePosts.filter((post) => airtablePostIds.has(post.postId));

    // Group posts by date (YYYY-MM-DD format for calendar)
    const countsByDate: Record<string, number> = {};

    for (const post of posts) {
      // Convert Unix timestamp (seconds) to Date
      const date = new Date(post.postedAt * 1000);

      // Format as YYYY-MM-DD in UTC
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      countsByDate[dateKey] = (countsByDate[dateKey] ?? 0) + 1;
    }

    return countsByDate;
  },
});

export const getBundleSocialPostsByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

export const getAirtablePostsByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

export const getSnapshotsByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("bundleSocialSnapshots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

export const getCampaignById = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("airtableCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();
  },
});

const aggregatePostsByDate = (posts: Array<{ postId: string; postedAt: number }>) => {
  // Group posts by date (YYYY-MM-DD format for calendar)
  const countsByDate: Array<{ date: string; count: number }> = [];
  const dateCountMap: Record<string, number> = {};
  for (const post of posts) {
    // Convert Unix timestamp (seconds) to Date
    const date = new Date(post.postedAt * 1000);

    // Format as YYYY-MM-DD in UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    dateCountMap[dateKey] = (dateCountMap[dateKey] ?? 0) + 1;
  }

  for (const [date, count] of Object.entries(dateCountMap)) {
    countsByDate.push({ date, count });
  }

  return countsByDate;
};

export const upsertCampaignAnalytics = internalMutation({
  args: {
    campaignId: v.string(),
    campaignName: v.string(),
    artist: v.string(),
    song: v.string(),
    totalPosts: v.number(),
    totalViews: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalShares: v.number(),
    totalSaves: v.number(),
    topVideos: v.array(v.object({
      videoId: v.string(),
      postedAt: v.number(),
      videoUrl: v.string(),
      mediaUrl: v.optional(v.string()),
      views: v.number(),
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
    })),
    postCountsByDate: v.array(v.object({
      date: v.string(),
      count: v.number(),
    })),
    dailyTotalSnapshots: v.record(v.string(), v.object({
      totalViews: v.number(),
      totalLikes: v.number(),
      totalComments: v.number(),
      totalShares: v.number(),
      totalSaves: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if analytics already exist for this campaign
    const existing = await ctx.db
      .query("campaignAnalytics")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        campaignName: args.campaignName,
        artist: args.artist,
        song: args.song,
        totalPosts: args.totalPosts,
        totalViews: args.totalViews,
        totalLikes: args.totalLikes,
        totalComments: args.totalComments,
        totalShares: args.totalShares,
        totalSaves: args.totalSaves,
        topVideos: args.topVideos,
        postCountsByDate: args.postCountsByDate,
        dailyTotalSnapshots: args.dailyTotalSnapshots,
      });
      return existing._id;
    } else {
      // Insert new record
      return await ctx.db.insert("campaignAnalytics", {
        campaignId: args.campaignId,
        campaignName: args.campaignName,
        artist: args.artist,
        song: args.song,
        totalPosts: args.totalPosts,
        totalViews: args.totalViews,
        totalLikes: args.totalLikes,
        totalComments: args.totalComments,
        totalShares: args.totalShares,
        totalSaves: args.totalSaves,
        topVideos: args.topVideos,
        postCountsByDate: args.postCountsByDate,
        dailyTotalSnapshots: args.dailyTotalSnapshots,
      });
    }
  },
});

export const calculateCampaignAnalytics = internalAction({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.runQuery(internal.app.analytics.getCampaignById, { campaignId });
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const bundlePosts: Doc<"bundleSocialPostedVideos">[] = await ctx.runQuery(internal.app.analytics.getBundleSocialPostsByCampaign, { campaignId });
    const airtablePosts: Doc<"airtableContents">[] = await ctx.runQuery(internal.app.analytics.getAirtablePostsByCampaign, { campaignId });
    const bundleSnapshots: Doc<"bundleSocialSnapshots">[] = await ctx.runQuery(internal.app.analytics.getSnapshotsByCampaign, { campaignId });

    // Only include bundlePosts that have a matching postId in airtablePosts
    const airtablePostIds = new Set(airtablePosts.map((item: Doc<"airtableContents">) => item.postId));
    const posts: Doc<"bundleSocialPostedVideos">[] = bundlePosts.filter((post: Doc<"bundleSocialPostedVideos">) => airtablePostIds.has(post.postId));
    const snapshots: Doc<"bundleSocialSnapshots">[] = bundleSnapshots.filter((snapshot: Doc<"bundleSocialSnapshots">) => airtablePostIds.has(snapshot.postId));

    const postsByDate = aggregatePostsByDate(posts);
    const totalPosts: number = posts.length;
    const totalViews: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.views, 0);
    const totalLikes: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.likes, 0);
    const totalComments: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.comments, 0);
    const totalShares: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.shares, 0);
    const totalSaves: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.saves, 0);

    // Only include the specified fields for the top videos.
    const topVideos = posts
      .sort((a: Doc<"bundleSocialPostedVideos">, b: Doc<"bundleSocialPostedVideos">) => b.views - a.views)
      .slice(0, 100)
      .map(
        ({
          videoId,
          postedAt,
          videoUrl,
          mediaUrl,
          views,
          likes,
          comments,
          shares,
          saves,
        }: Doc<"bundleSocialPostedVideos">) => ({
          videoId,
          postedAt,
          videoUrl,
          mediaUrl,
          views,
          likes,
          comments,
          shares,
          saves,
        })
      );

    const dailyTotalSnapshots = snapshots.reduce((acc: Record<string, { totalViews: number; totalLikes: number; totalComments: number; totalShares: number; totalSaves: number; }>, snapshot: Doc<"bundleSocialSnapshots">) => {
      const date = snapshot.date;
      acc[date] = {
        totalViews: (acc[date]?.totalViews ?? 0) + snapshot.views,
        totalLikes: (acc[date]?.totalLikes ?? 0) + snapshot.likes,
        totalComments: (acc[date]?.totalComments ?? 0) + snapshot.comments,
        totalShares: (acc[date]?.totalShares ?? 0) + snapshot.shares,
        totalSaves: (acc[date]?.totalSaves ?? 0) + snapshot.saves,
      };
      return acc;
    }, {} as Record<string, { totalViews: number; totalLikes: number; totalComments: number; totalShares: number; totalSaves: number; }>);

    // Upsert campaign analytics
    await ctx.runMutation(internal.app.analytics.upsertCampaignAnalytics, {
      campaignId,
      campaignName: campaign.campaignName,
      artist: campaign.artist,
      song: campaign.song,
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      topVideos,
      postCountsByDate: postsByDate,
      dailyTotalSnapshots
    });

    return {
      campaignId,
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      topVideosCount: topVideos.length,
      dailyTotalSnapshots,
    };
  },
});