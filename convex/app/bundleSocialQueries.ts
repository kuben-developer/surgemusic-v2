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

// Delete post by postId
export const deletePostByPostId = internalMutation({
  args: { postId: v.string() },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .first();

    if (post) {
      await ctx.db.delete(post._id);
      return true;
    }
    return false;
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

// Get campaign analytics (reads pre-aggregated data or filters by post date)
export const getCampaignAnalytics = internalQuery({
  args: {
    campaignId: v.string(),
    days: v.optional(v.number()), // Optional: 7, 30, or 90 (for backward compatibility)
    postedStartDate: v.optional(v.number()), // Optional: Unix timestamp in seconds
    postedEndDate: v.optional(v.number()), // Optional: Unix timestamp in seconds
  },
  handler: async (ctx, { campaignId, days, postedStartDate, postedEndDate }) => {
    // Helper: Format dates as DD-MM-YYYY
    const formatDate = (date: Date) => {
      return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    // Helper: Calculate growth
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Helper: Forward-fill missing dates with previous day's values
    const forwardFillMissingDates = <T extends { date: string; views: number; likes: number; comments: number; shares: number; saves: number }>(
      data: T[]
    ): T[] => {
      if (data.length === 0) return data;
      if (data.length === 1) return data;

      // Parse date string (DD-MM-YYYY) to Date object
      const parseDate = (dateStr: string): Date => {
        const parts = dateStr.split('-');
        const day = parseInt(parts[0] || '0', 10);
        const month = parseInt(parts[1] || '0', 10);
        const year = parseInt(parts[2] || '0', 10);
        return new Date(year, month - 1, day);
      };

      const firstDate = parseDate(data[0].date);
      const lastDate = parseDate(data[data.length - 1].date);

      // Create a map of existing dates for quick lookup
      const dataByDate = new Map<string, T>();
      for (const item of data) {
        dataByDate.set(item.date, item);
      }

      // Generate all dates between first and last
      const filledData: T[] = [];
      const currentDate = new Date(firstDate);
      let previousEntry = data[0];

      while (currentDate <= lastDate) {
        const dateStr = formatDate(currentDate);
        const existing = dataByDate.get(dateStr);

        if (existing) {
          // Use existing snapshot
          filledData.push(existing);
          previousEntry = existing;
        } else {
          // Forward-fill from previous entry
          filledData.push({
            ...previousEntry,
            date: dateStr,
          });
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return filledData;
    };

    // If post date filter is provided, use snapshot-based filtering
    if (postedStartDate !== undefined && postedEndDate !== undefined) {
      // 1. Filter posts by postedAt timestamp
      const allPosts = await ctx.db
        .query("bundleSocialPostedVideos")
        .withIndex("by_campaignId_postedAt", (q) =>
          q.eq("campaignId", campaignId)
           .gte("postedAt", postedStartDate)
           .lte("postedAt", postedEndDate)
        )
        .collect();

      // Get postIds from filtered videos
      const filteredPostIds = new Set(allPosts.map(post => post.postId));

      if (filteredPostIds.size === 0) {
        // No posts in this date range
        return {
          totals: { posts: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 },
          growth: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 },
          engagementRate: "0.00",
          engagementGrowth: "0.00",
          dailyData: [],
          videoMetrics: [],
          lastUpdatedAt: Date.now(),
        };
      }

      // 2. Get all snapshots for these postIds
      const allSnapshots = await ctx.db
        .query("bundleSocialSnapshots")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect();

      // Filter snapshots to only include those from filtered posts
      const filteredSnapshots = allSnapshots.filter(snapshot =>
        filteredPostIds.has(snapshot.postId)
      );

      // 3. Aggregate snapshots by date WITH per-post forward-fill
      // For each date, sum the most recent snapshot for each post

      // Helper to parse date string for comparison
      const parseDateForComparison = (dateStr: string): number => {
        const parts = dateStr.split('-');
        const day = parseInt(parts[0] || '0', 10);
        const month = parseInt(parts[1] || '0', 10);
        const year = parseInt(parts[2] || '0', 10);
        return new Date(year, month - 1, day).getTime();
      };

      // Get unique sorted dates from snapshots
      const uniqueDates = [...new Set(filteredSnapshots.map(s => s.date))].sort((a, b) =>
        parseDateForComparison(a) - parseDateForComparison(b)
      );

      const snapshotsByDate = new Map<string, {
        views: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        updatedAt: number;
      }>();

      // For each date, calculate totals by using most recent snapshot per post
      for (const date of uniqueDates) {
        const dateTimestamp = parseDateForComparison(date);
        let totalViews = 0;
        let totalLikes = 0;
        let totalComments = 0;
        let totalShares = 0;
        let totalSaves = 0;
        let maxUpdatedAt = 0;

        // For each post, find its most recent snapshot <= current date
        for (const postId of filteredPostIds) {
          // Get all snapshots for this post up to current date
          const postSnapshotsUpToDate = filteredSnapshots
            .filter(s => s.postId === postId && parseDateForComparison(s.date) <= dateTimestamp)
            .sort((a, b) => parseDateForComparison(b.date) - parseDateForComparison(a.date));

          // Use the most recent snapshot (first after sorting desc)
          const mostRecentSnapshot = postSnapshotsUpToDate[0];
          if (mostRecentSnapshot) {
            totalViews += mostRecentSnapshot.views;
            totalLikes += mostRecentSnapshot.likes;
            totalComments += mostRecentSnapshot.comments;
            totalShares += mostRecentSnapshot.shares;
            totalSaves += mostRecentSnapshot.saves;
            maxUpdatedAt = Math.max(maxUpdatedAt, mostRecentSnapshot.updatedAt);
          }
        }

        snapshotsByDate.set(date, {
          views: totalViews,
          likes: totalLikes,
          comments: totalComments,
          shares: totalShares,
          saves: totalSaves,
          updatedAt: maxUpdatedAt,
        });
      }

      // Convert to array and sort by date
      const sortedDailyData = Array.from(snapshotsByDate.entries())
        .map(([date, metrics]) => ({ date, ...metrics }))
        .sort((a, b) => {
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

      // Forward-fill missing dates with previous day's values
      const dailyData = forwardFillMissingDates(sortedDailyData);

      // 4. Calculate totals from current post data (not snapshots)
      // Sum up the latest metrics from the filtered posts
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalSaves = 0;

      for (const post of allPosts) {
        totalViews += post.views;
        totalLikes += post.likes;
        totalComments += post.comments;
        totalShares += post.shares;
        totalSaves += post.saves;
      }

      const totals = {
        posts: filteredPostIds.size,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        saves: totalSaves,
      };

      // Forward-fill to today using current post data if latest snapshot is not today
      const today = formatDate(new Date());
      const latestSnapshotDate = dailyData[dailyData.length - 1]?.date;

      if (latestSnapshotDate !== today && dailyData.length > 0) {
        // Add today's entry using current post totals
        dailyData.push({
          date: today,
          views: totalViews,
          likes: totalLikes,
          comments: totalComments,
          shares: totalShares,
          saves: totalSaves,
          updatedAt: Date.now(),
        });
      }

      const latestRecord = dailyData[dailyData.length - 1];
      const firstRecord = dailyData[0];

      // 5. Calculate growth metrics
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

      // 6. Calculate engagement rate
      const engagementRate = totals.views > 0
        ? ((totals.likes + totals.comments + totals.shares + totals.saves) / totals.views) * 100
        : 0;

      const previousEngagementRate = firstRecord && firstRecord.views > 0
        ? ((firstRecord.likes + firstRecord.comments + firstRecord.shares + firstRecord.saves) / firstRecord.views) * 100
        : 0;

      const engagementGrowth = calculateGrowth(engagementRate, previousEngagementRate);

      // 7. Get video metrics (filtered posts only)
      const videoMetrics = allPosts
        .sort((a, b) => b.views - a.views)
        .slice(0, 100)
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

      const lastUpdatedAt = latestRecord?.updatedAt || Date.now();

      return {
        totals,
        growth,
        engagementRate: engagementRate.toFixed(2),
        engagementGrowth: engagementGrowth.toFixed(2),
        dailyData: dailyData.map(({ date, views, likes, comments, shares, saves }) => ({
          date,
          views,
          likes,
          comments,
          shares,
          saves,
        })),
        videoMetrics,
        lastUpdatedAt,
      };
    }

    // Default behavior: use snapshot-based data filtering out deleted posts
    const effectiveDays = days || 30; // Default to 30 days if not specified

    // 1. Get ALL current posts for this campaign (filters out deleted posts)
    const allPosts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Get postIds from current videos (only these are valid)
    const validPostIds = new Set(allPosts.map(post => post.postId));

    if (validPostIds.size === 0) {
      // No posts in this campaign
      return {
        totals: { posts: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 },
        growth: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 },
        engagementRate: "0.00",
        engagementGrowth: "0.00",
        dailyData: [],
        videoMetrics: [],
        lastUpdatedAt: Date.now(),
      };
    }

    // 2. Get all snapshots for this campaign and filter by valid postIds only
    const allSnapshots = await ctx.db
      .query("bundleSocialSnapshots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter snapshots to only include those from current posts (exclude deleted)
    const validSnapshots = allSnapshots.filter(snapshot =>
      validPostIds.has(snapshot.postId)
    );

    // 3. Aggregate snapshots by date WITH per-post forward-fill
    // For each date, sum the most recent snapshot for each post

    // Helper to parse date string for comparison
    const parseDateForComparison = (dateStr: string): number => {
      const parts = dateStr.split('-');
      const day = parseInt(parts[0] || '0', 10);
      const month = parseInt(parts[1] || '0', 10);
      const year = parseInt(parts[2] || '0', 10);
      return new Date(year, month - 1, day).getTime();
    };

    // Get unique sorted dates from snapshots
    const uniqueDates = [...new Set(validSnapshots.map(s => s.date))].sort((a, b) =>
      parseDateForComparison(a) - parseDateForComparison(b)
    );

    const snapshotsByDate = new Map<string, {
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      updatedAt: number;
    }>();

    // For each date, calculate totals by using most recent snapshot per post
    for (const date of uniqueDates) {
      const dateTimestamp = parseDateForComparison(date);
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalSaves = 0;
      let maxUpdatedAt = 0;

      // For each post, find its most recent snapshot <= current date
      for (const postId of validPostIds) {
        // Get all snapshots for this post up to current date
        const postSnapshotsUpToDate = validSnapshots
          .filter(s => s.postId === postId && parseDateForComparison(s.date) <= dateTimestamp)
          .sort((a, b) => parseDateForComparison(b.date) - parseDateForComparison(a.date));

        // Use the most recent snapshot (first after sorting desc)
        const mostRecentSnapshot = postSnapshotsUpToDate[0];
        if (mostRecentSnapshot) {
          totalViews += mostRecentSnapshot.views;
          totalLikes += mostRecentSnapshot.likes;
          totalComments += mostRecentSnapshot.comments;
          totalShares += mostRecentSnapshot.shares;
          totalSaves += mostRecentSnapshot.saves;
          maxUpdatedAt = Math.max(maxUpdatedAt, mostRecentSnapshot.updatedAt);
        }
      }

      snapshotsByDate.set(date, {
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        saves: totalSaves,
        updatedAt: maxUpdatedAt,
      });
    }

    // 4. Convert to array and sort by date
    const sortedDailyData = Array.from(snapshotsByDate.entries())
      .map(([date, metrics]) => ({ date, ...metrics }))
      .sort((a, b) => {
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

    // Forward-fill missing dates with previous day's values
    const filledDailyData = forwardFillMissingDates(sortedDailyData);

    // 5. Filter to last X days
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - effectiveDays * 24 * 60 * 60 * 1000);

    const performanceInRange = filledDailyData.filter((record) => {
      const parts = record.date.split('-');
      const day = parseInt(parts[0] || '0', 10);
      const month = parseInt(parts[1] || '0', 10);
      const year = parseInt(parts[2] || '0', 10);
      const recordDate = new Date(year, month - 1, day);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // 6. Calculate totals from current post data (not snapshots)
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalSaves = 0;

    for (const post of allPosts) {
      totalViews += post.views;
      totalLikes += post.likes;
      totalComments += post.comments;
      totalShares += post.shares;
      totalSaves += post.saves;
    }

    const totals = {
      posts: validPostIds.size,
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      saves: totalSaves,
    };

    // Forward-fill to today using current post data if latest snapshot is not today
    const today = formatDate(new Date());
    const latestSnapshotDate = performanceInRange[performanceInRange.length - 1]?.date;

    if (latestSnapshotDate !== today && performanceInRange.length > 0) {
      // Add today's entry using current post totals
      performanceInRange.push({
        date: today,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        saves: totalSaves,
        updatedAt: Date.now(),
      });
    }

    const latestRecord = performanceInRange[performanceInRange.length - 1];
    const firstRecord = performanceInRange[0];

    // Calculate growth metrics (comparing first vs last day in range)
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

    // Sort posts by views descending and limit to top 100 (already have allPosts)
    const videoMetrics = allPosts
      .sort((a, b) => b.views - a.views)
      .slice(0, 100)
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

    // if (existing) {
    //   // Update existing record
    //   await ctx.db.patch(existing._id, { metadata });
    // } else {
    //   // Insert new record
    //   await ctx.db.insert("airtableCampaigns", {
    //     campaignId,
    //     metadata,
    //   });
    // }
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

    // return campaign?.metadata || null;
    return null;
  },
});

// Get post counts by date for calendar display
export const getPostCountsByDate = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }): Promise<Record<string, number>> => {
    // Get all posts for this campaign
    const posts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

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

// Delete all campaign performance records for a specific campaign
export const deleteCampaignPerformance = internalMutation({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const records = await ctx.db
      .query("bundleSocialCampaignPerformance")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    for (const record of records) {
      await ctx.db.delete(record._id);
    }

    return records.length;
  },
});

// Get all snapshots for a campaign
export const getAllSnapshotsForCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("bundleSocialSnapshots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});
