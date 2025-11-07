import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "../_generated/server";

// Check if post exists
export const checkPostExists = internalQuery({
  args: { postId: v.string() },
  handler: async (ctx, { postId }): Promise<boolean> => {
    const existing = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .first();
    return existing !== null;
  },
});

// Insert new post
export const insertPost = internalMutation({
  args: {
    campaignId: v.string(),
    postId: v.string(),
    videoId: v.string(),
    postedAt: v.number(),
    videoUrl: v.string(),
    mediaUrl: v.optional(v.string()),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("bundleSocialPostedVideos", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

// Get all posts for refresh
export const getAllPosts = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bundleSocialPostedVideos").collect();
  },
});

// Get all posts for a specific campaign
export const getPostsByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

// Get unique campaign IDs that have posts
export const getUniqueCampaignIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("bundleSocialPostedVideos").collect();
    const uniqueCampaignIds = [...new Set(posts.map(post => post.campaignId))];
    return uniqueCampaignIds;
  },
});

// Update post stats
export const updatePostStats = internalMutation({
  args: {
    postId: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
  },
  handler: async (ctx, { postId, views, likes, comments, shares, saves }) => {
    const post = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .first();

    if (!post) return;

    await ctx.db.patch(post._id, {
      views,
      likes,
      comments,
      shares,
      saves,
      updatedAt: Date.now(),
    });
  },
});

// Upsert snapshot
export const upsertSnapshot = internalMutation({
  args: {
    campaignId: v.string(),
    postId: v.string(),
    date: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
  },
  handler: async (ctx, { campaignId, postId, date, views, likes, comments, shares, saves }) => {
    // Check if snapshot exists for this campaign and date
    const existing = await ctx.db
      .query("bundleSocialSnapshots")
      .withIndex("by_campaignId_date", (q) =>
        q.eq("campaignId", campaignId).eq("date", date)
      )
      .filter((q) => q.eq(q.field("postId"), postId))
      .first();

    if (existing) {
      // Update existing snapshot
      await ctx.db.patch(existing._id, {
        views,
        likes,
        comments,
        shares,
        saves,
        updatedAt: Date.now(),
      });
    } else {
      // Insert new snapshot
      await ctx.db.insert("bundleSocialSnapshots", {
        campaignId,
        postId,
        date,
        views,
        likes,
        comments,
        shares,
        saves,
        updatedAt: Date.now(),
      });
    }
  },
});

// Upsert campaign performance (aggregated stats)
export const upsertCampaignPerformance = internalMutation({
  args: {
    campaignId: v.string(),
    date: v.string(),
    posts: v.number(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
  },
  handler: async (ctx, { campaignId, date, posts, views, likes, comments, shares, saves }) => {
    // Check if performance record exists for this campaign and date
    const existing = await ctx.db
      .query("bundleSocialCampaignPerformance")
      .withIndex("by_campaignId_date", (q) =>
        q.eq("campaignId", campaignId).eq("date", date)
      )
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        posts,
        views,
        likes,
        comments,
        shares,
        saves,
        updatedAt: Date.now(),
      });
    } else {
      // Insert new record
      await ctx.db.insert("bundleSocialCampaignPerformance", {
        campaignId,
        date,
        posts,
        views,
        likes,
        comments,
        shares,
        saves,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get campaign analytics (reads pre-aggregated data)
export const getCampaignAnalytics = internalQuery({
  args: {
    campaignId: v.string(),
    days: v.number(), // 7, 30, or 90
  },
  handler: async (ctx, { campaignId, days }) => {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Format dates as DD-MM-YYYY
    const formatDate = (date: Date) => {
      return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    // Get all performance records for this campaign
    const allPerformance = await ctx.db
      .query("bundleSocialCampaignPerformance")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter by date range
    const performanceInRange = allPerformance.filter((record) => {
      const parts = record.date.split('-');
      const day = parseInt(parts[0] || '0', 10);
      const month = parseInt(parts[1] || '0', 10);
      const year = parseInt(parts[2] || '0', 10);
      const recordDate = new Date(year, month - 1, day);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Sort by date ascending
    performanceInRange.sort((a, b) => {
      const partsA = a.date.split('-');
      const dayA = parseInt(partsA[0] || '0', 10);
      const monthA = parseInt(partsA[1] || '0', 10);
      const yearA = parseInt(partsA[2] || '0', 10);

      const partsB = b.date.split('-');
      const dayB = parseInt(partsB[0] || '0', 10);
      const monthB = parseInt(partsB[1] || '0', 10);
      const yearB = parseInt(partsB[2] || '0', 10);

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate totals from latest record
    const latestRecord = performanceInRange[performanceInRange.length - 1];
    const firstRecord = performanceInRange[0];

    const totals = latestRecord ? {
      posts: latestRecord.posts,
      views: latestRecord.views,
      likes: latestRecord.likes,
      comments: latestRecord.comments,
      shares: latestRecord.shares,
      saves: latestRecord.saves,
    } : {
      posts: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
    };

    // Calculate growth metrics (comparing first vs last day in range)
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const growth = firstRecord && latestRecord ? {
      views: calculateGrowth(latestRecord.views, firstRecord.views),
      likes: calculateGrowth(latestRecord.likes, firstRecord.likes),
      comments: calculateGrowth(latestRecord.comments, firstRecord.comments),
      shares: calculateGrowth(latestRecord.shares, firstRecord.shares),
      saves: calculateGrowth(latestRecord.saves, firstRecord.saves),
    } : {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
    };

    // Calculate engagement rate
    const engagementRate = totals.views > 0
      ? ((totals.likes + totals.comments + totals.shares + totals.saves) / totals.views) * 100
      : 0;

    const previousEngagementRate = firstRecord && firstRecord.views > 0
      ? ((firstRecord.likes + firstRecord.comments + firstRecord.shares + firstRecord.saves) / firstRecord.views) * 100
      : 0;

    const engagementGrowth = calculateGrowth(engagementRate, previousEngagementRate);

    // Format daily data for chart
    const dailyData = performanceInRange.map((record) => ({
      date: record.date,
      views: record.views,
      likes: record.likes,
      comments: record.comments,
      shares: record.shares,
      saves: record.saves,
    }));

    // Get individual posts for video performance table
    const posts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Sort posts by views descending
    const videoMetrics = posts
      .sort((a, b) => b.views - a.views)
      .map((post) => ({
        postId: post.postId,
        videoId: post.videoId,
        videoUrl: post.videoUrl,
        mediaUrl: post.mediaUrl,
        postedAt: post.postedAt,
        views: post.views,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        saves: post.saves,
      }));

    // Get last updated timestamp
    const lastUpdatedAt = latestRecord?.updatedAt || Date.now();

    return {
      totals,
      growth,
      engagementRate: engagementRate.toFixed(2),
      engagementGrowth: engagementGrowth.toFixed(2),
      dailyData,
      videoMetrics,
      lastUpdatedAt,
    };
  },
});

// Upsert airtable campaign sync statistics
export const upsertAirtableCampaignStats = internalMutation({
  args: {
    campaignId: v.string(),
    posted: v.number(),
    noPostId: v.number(),
    noVideoUrl: v.number(),
    scheduled: v.number(),
    errors: v.array(v.string()),
  },
  handler: async (ctx, { campaignId, posted, noPostId, noVideoUrl, scheduled, errors }) => {
    // Check if campaign record exists
    const existing = await ctx.db
      .query("airtableCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const metadata = {
      posted,
      noPostId,
      noVideoUrl,
      scheduled,
      errors,
    };

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, { metadata });
    } else {
      // Insert new record
      await ctx.db.insert("airtableCampaigns", {
        campaignId,
        metadata,
      });
    }
  },
});

// Get airtable campaign sync metadata
export const getAirtableCampaignMetadata = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db
      .query("airtableCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    return campaign?.metadata || null;
  },
});
