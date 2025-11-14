import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, query } from "../_generated/server";
import { api, internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";

/**
 * Date utility functions for DD-MM-YYYY format
 */

/**
 * Parse a date string in DD-MM-YYYY format to a Date object
 * @param dateStr - Date string in DD-MM-YYYY format (e.g., "24-11-2023")
 * @returns Date object
 */
const parseDate = (dateStr: string): Date => {
  const parts = dateStr.split('-').map(Number);
  const day = parts[0] ?? 1;
  const month = parts[1] ?? 1;
  const year = parts[2] ?? 2000;
  return new Date(year, month - 1, day);
};

/**
 * Format a Date object to DD-MM-YYYY format
 * @param date - Date object
 * @returns Date string in DD-MM-YYYY format (e.g., "24-11-2023")
 */
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Generate an array of all dates between start and end (inclusive)
 * @param start - Start date
 * @param end - End date
 * @returns Array of Date objects for each day in the range
 */
const getDatesBetween = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * Snapshot data structure for forward filling
 */
interface SnapshotData {
  postId: string;
  postedAt: number;  // Unix timestamp in seconds - from bundleSocialPostedVideos
  date: string;      // Snapshot date in DD-MM-YYYY format
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

/**
 * Forward fill snapshots to ensure no gaps in daily data for each post
 *
 * For posts WITH snapshots:
 * - Finds the first snapshot date for the post
 * - Extends snapshots from first date to TODAY
 * - Forward fills missing dates with the most recent snapshot data
 *
 * For posts WITHOUT snapshots:
 * - Backfills from post's postedAt date to TODAY
 * - Uses current values from bundleSocialPostedVideos
 *
 * This ensures ALL posts contribute to daily totals through today.
 *
 * @param snapshots - Array of snapshot documents
 * @param posts - Array of post documents from bundleSocialPostedVideos
 * @returns Array of forward-filled snapshot data
 *
 * @example
 * Input (on Nov 11):
 *   Post A: snapshots on Nov 8, 9, 10
 *   Post B: snapshots on Nov 8, 11
 *   Post C: no snapshots (posted Nov 9, current views: 1000)
 * Output:
 *   Post A: Nov 8, 9, 10, 11 (Nov 11 filled from Nov 10)
 *   Post B: Nov 8, 9 (filled from 8), 10 (filled from 8), 11
 *   Post C: Nov 9, 10, 11 (all using current values: 1000 views)
 */
const forwardFillSnapshots = (
  snapshots: Doc<"bundleSocialSnapshots">[],
  posts: Doc<"bundleSocialPostedVideos">[]
): SnapshotData[] => {
  // Create a map of postId -> postedAt timestamp
  // IMPORTANT: Always get postedAt from bundleSocialPostedVideos, not from snapshot timing
  const postIdToPostedAt = new Map<string, number>();
  for (const post of posts) {
    postIdToPostedAt.set(post.postId, post.postedAt);
  }

  // Group snapshots by postId
  const snapshotsByPost = new Map<string, Doc<"bundleSocialSnapshots">[]>();

  for (const snapshot of snapshots) {
    const existing = snapshotsByPost.get(snapshot.postId) ?? [];
    existing.push(snapshot);
    snapshotsByPost.set(snapshot.postId, existing);
  }

  const filledSnapshots: SnapshotData[] = [];

  // Use today's date as the end date for all posts
  const today = new Date();
  // Set to start of day to avoid time comparison issues
  today.setHours(0, 0, 0, 0);

  // Process each post's snapshots
  for (const [postId, postSnapshots] of snapshotsByPost.entries()) {
    // Get postedAt from posts array
    const postedAt = postIdToPostedAt.get(postId);
    if (!postedAt) continue; // Skip if we don't have post data
    // Skip if no snapshots for this post
    if (postSnapshots.length === 0) continue;

    // Sort snapshots by date
    const sortedSnapshots = postSnapshots.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Find first snapshot date - extend from first snapshot to TODAY
    const firstSnapshotItem = sortedSnapshots[0];
    if (!firstSnapshotItem) continue;

    const firstDate = parseDate(firstSnapshotItem.date);
    const lastDate = today; // Always extend to today

    // Create a map of date -> snapshot for quick lookup
    const snapshotMap = new Map<string, Doc<"bundleSocialSnapshots">>();
    for (const snapshot of sortedSnapshots) {
      snapshotMap.set(snapshot.date, snapshot);
    }

    // Generate all dates between first and last
    const allDates = getDatesBetween(firstDate, lastDate);

    // Forward fill: use most recent snapshot for missing dates
    let lastSnapshot: SnapshotData | null = null;

    for (const date of allDates) {
      const dateStr = formatDate(date);
      const snapshot = snapshotMap.get(dateStr);

      if (snapshot) {
        // We have data for this date
        lastSnapshot = {
          postId,
          postedAt,
          date: dateStr,
          views: snapshot.views,
          likes: snapshot.likes,
          comments: snapshot.comments,
          shares: snapshot.shares,
          saves: snapshot.saves,
        };
        filledSnapshots.push(lastSnapshot);
      } else if (lastSnapshot) {
        // Forward fill from last snapshot
        filledSnapshots.push({
          postId,
          postedAt,
          date: dateStr,
          views: lastSnapshot.views,
          likes: lastSnapshot.likes,
          comments: lastSnapshot.comments,
          shares: lastSnapshot.shares,
          saves: lastSnapshot.saves,
        });
      }
      // If no lastSnapshot, we skip (shouldn't happen as we start from first snapshot)
    }
  }

  // Process posts that have NO snapshots at all
  // These posts exist in bundleSocialPostedVideos but have zero entries in bundleSocialSnapshots
  const postIdsWithSnapshots = new Set(snapshotsByPost.keys());
  const postsWithoutSnapshots = posts.filter(post => !postIdsWithSnapshots.has(post.postId));

  for (const post of postsWithoutSnapshots) {
    // Backfill from post's creation date to today using current values
    const postDate = new Date(post.postedAt * 1000); // Convert Unix timestamp (seconds) to Date
    postDate.setHours(0, 0, 0, 0); // Set to start of day

    // Generate all dates from post date to today
    const allDates = getDatesBetween(postDate, today);

    // Create snapshot entries for all dates using current post values
    for (const date of allDates) {
      filledSnapshots.push({
        postId: post.postId,
        postedAt: post.postedAt,
        date: formatDate(date),
        views: post.views,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        saves: post.saves,
      });
    }
  }

  return filledSnapshots;
};

/**
 * Daily snapshot totals structure
 */
interface DailySnapshot {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}

/**
 * Calculate daily total snapshots by aggregating all posts' metrics for each date
 *
 * Takes forward-filled snapshots and aggregates them by date to get totals across all posts.
 *
 * @param snapshots - Array of snapshot data (can be forward-filled or raw)
 * @returns Record of date -> daily totals
 *
 * @example
 * Input:
 *   - Post A: Jan 2 (100 views), Jan 3 (150 views)
 *   - Post B: Jan 2 (200 views), Jan 3 (250 views)
 * Output:
 *   - "02-01-2025": { totalViews: 300, ... }
 *   - "03-01-2025": { totalViews: 400, ... }
 */
const calculateDailyTotalSnapshots = (snapshots: SnapshotData[]): Record<string, DailySnapshot> => {
  return snapshots.reduce((acc, snapshot) => {
    const date = snapshot.date;
    acc[date] = {
      totalViews: (acc[date]?.totalViews ?? 0) + snapshot.views,
      totalLikes: (acc[date]?.totalLikes ?? 0) + snapshot.likes,
      totalComments: (acc[date]?.totalComments ?? 0) + snapshot.comments,
      totalShares: (acc[date]?.totalShares ?? 0) + snapshot.shares,
      totalSaves: (acc[date]?.totalSaves ?? 0) + snapshot.saves,
    };
    return acc;
  }, {} as Record<string, DailySnapshot>);
};

/**
 * Post date analytics structure
 */
interface PostDateAnalytics {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  dailySnapshots: Record<string, DailySnapshot>;
}

/**
 * Calculate daily total snapshots grouped by post date
 *
 * Groups all analytics by the date posts were published (postedAt), providing:
 * - Aggregate metrics for posts from each date
 * - Top videos from each posting date
 * - Daily performance tracking for each date's posts
 *
 * @param snapshots - Array of forward-filled snapshot data
 * @param posts - Array of post documents from bundleSocialPostedVideos
 * @returns Record of post date -> complete analytics
 *
 * @example
 * Output:
 * {
 *   "08-11-2025": {
 *     totalPosts: 234,
 *     totalViews: 234234,
 *     topVideos: [...],
 *     dailySnapshots: {
 *       "08-11-2025": { totalViews: 234234, ... },
 *       "09-11-2025": { totalViews: 334234, ... }
 *     }
 *   }
 * }
 */
const calculateDailyTotalSnapshotsByPostDate = (
  snapshots: SnapshotData[],
  posts: Doc<"bundleSocialPostedVideos">[]
): Record<string, PostDateAnalytics> => {
  // Helper: Convert Unix timestamp (seconds) to DD-MM-YYYY
  const timestampToDateString = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Group posts by their posted date
  const postsByDate = new Map<string, Doc<"bundleSocialPostedVideos">[]>();
  for (const post of posts) {
    const postDateStr = timestampToDateString(post.postedAt);
    const existing = postsByDate.get(postDateStr) ?? [];
    existing.push(post);
    postsByDate.set(postDateStr, existing);
  }

  // Group snapshots by post date
  const snapshotsByPostDate = new Map<string, SnapshotData[]>();
  for (const snapshot of snapshots) {
    const postDateStr = timestampToDateString(snapshot.postedAt);
    const existing = snapshotsByPostDate.get(postDateStr) ?? [];
    existing.push(snapshot);
    snapshotsByPostDate.set(postDateStr, existing);
  }

  const result: Record<string, PostDateAnalytics> = {};

  // Process each post date
  for (const [postDate, datePosts] of postsByDate.entries()) {
    const dateSnapshots = snapshotsByPostDate.get(postDate) ?? [];

    // Calculate aggregate metrics from current post values
    const totalPosts = datePosts.length;
    const totalViews = datePosts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = datePosts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = datePosts.reduce((sum, post) => sum + post.comments, 0);
    const totalShares = datePosts.reduce((sum, post) => sum + post.shares, 0);
    const totalSaves = datePosts.reduce((sum, post) => sum + post.saves, 0);

    // Calculate daily snapshots for posts from this date
    const dailySnapshots: Record<string, DailySnapshot> = {};
    for (const snapshot of dateSnapshots) {
      const snapshotDate = snapshot.date;
      if (!dailySnapshots[snapshotDate]) {
        dailySnapshots[snapshotDate] = {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalSaves: 0,
        };
      }
      dailySnapshots[snapshotDate].totalViews += snapshot.views;
      dailySnapshots[snapshotDate].totalLikes += snapshot.likes;
      dailySnapshots[snapshotDate].totalComments += snapshot.comments;
      dailySnapshots[snapshotDate].totalShares += snapshot.shares;
      dailySnapshots[snapshotDate].totalSaves += snapshot.saves;
    }

    result[postDate] = {
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      dailySnapshots,
    };
  }

  return result;
};

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

/**
 * Get top videos by post date
 *
 * Fetches top 100 videos for a campaign, optionally filtered by posting dates.
 * Only includes videos that exist in airtableContents.
 *
 * @param campaignId - Airtable campaign ID
 * @param dates - Optional array of dates in DD-MM-YYYY format. If empty/undefined, returns top videos for entire campaign.
 * @returns Array of top 100 videos sorted by views (descending)
 *
 * @example
 * // Get top videos for specific dates
 * getTopVideosByPostDate({ campaignId: "recXXX", dates: ["08-11-2025", "09-11-2025"] })
 *
 * // Get top videos for entire campaign
 * getTopVideosByPostDate({ campaignId: "recXXX", dates: [] })
 * getTopVideosByPostDate({ campaignId: "recXXX" })
 */
/**
 * Get campaign analytics with optional date filtering
 *
 * Fetches campaign analytics from the campaignAnalytics table.
 * When dates are provided, filters to only show analytics for posts published on those dates.
 *
 * @param campaignId - Airtable campaign ID
 * @param dates - Optional array of post dates in DD-MM-YYYY format. If provided, filters to only posts published on these dates.
 * @returns Campaign analytics data with totals, daily data array, and metadata
 *
 * @example
 * // Get all-time analytics
 * getCampaignAnalytics({ campaignId: "recXXX" })
 *
 * // Get analytics for posts published on specific dates
 * getCampaignAnalytics({ campaignId: "recXXX", dates: ["08-11-2025", "09-11-2025"] })
 */
export const getCampaignAnalytics = query({
  args: {
    campaignId: v.string(),
    dates: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { campaignId, dates }) => {
    // Fetch campaign analytics record
    const analytics = await ctx.db
      .query("campaignAnalytics")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!analytics) {
      return null;
    }

    // If no date filter, return all-time data
    if (!dates || dates.length === 0) {
      // Transform dailySnapshots from record to array for charting
      const dailyData = Object.entries(analytics.dailySnapshots)
        .map(([date, snapshot]) => ({
          date,
          views: snapshot.totalViews,
          likes: snapshot.totalLikes,
          comments: snapshot.totalComments,
          shares: snapshot.totalShares,
          saves: snapshot.totalSaves,
        }))
        .sort((a, b) => {
          // Sort by date ascending
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          return dateA.getTime() - dateB.getTime();
        });

      return {
        campaignId: analytics.campaignId,
        campaignMetadata: {
          campaignId: analytics.campaignId,
          name: analytics.campaignName,
          artist: analytics.artist,
          song: analytics.song,
        },
        totals: {
          posts: analytics.totalPosts,
          views: analytics.totalViews,
          likes: analytics.totalLikes,
          comments: analytics.totalComments,
          shares: analytics.totalShares,
          saves: analytics.totalSaves,
        },
        dailyData,
        lastUpdatedAt: analytics._creationTime,
      };
    }

    // Filter by selected post dates
    const datesSet = new Set(dates);
    const filteredDateAnalytics = Object.entries(analytics.dailySnapshotsByDate)
      .filter(([postDate]) => datesSet.has(postDate));

    // Calculate filtered totals from dailySnapshotsByDate
    let totalPosts = 0;
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalSaves = 0;

    // Collect all unique snapshot dates from filtered post dates
    const snapshotDateMap = new Map<string, { views: number; likes: number; comments: number; shares: number; saves: number }>();

    for (const [, postDateData] of filteredDateAnalytics) {
      totalPosts += postDateData.totalPosts;
      totalViews += postDateData.totalViews;
      totalLikes += postDateData.totalLikes;
      totalComments += postDateData.totalComments;
      totalShares += postDateData.totalShares;
      totalSaves += postDateData.totalSaves;

      // Aggregate daily snapshots across filtered post dates
      for (const [snapshotDate, snapshot] of Object.entries(postDateData.dailySnapshots)) {
        const existing = snapshotDateMap.get(snapshotDate);
        if (existing) {
          existing.views += snapshot.totalViews;
          existing.likes += snapshot.totalLikes;
          existing.comments += snapshot.totalComments;
          existing.shares += snapshot.totalShares;
          existing.saves += snapshot.totalSaves;
        } else {
          snapshotDateMap.set(snapshotDate, {
            views: snapshot.totalViews,
            likes: snapshot.totalLikes,
            comments: snapshot.totalComments,
            shares: snapshot.totalShares,
            saves: snapshot.totalSaves,
          });
        }
      }
    }

    // Transform to array format for charting
    const dailyData = Array.from(snapshotDateMap.entries())
      .map(([date, snapshot]) => ({
        date,
        views: snapshot.views,
        likes: snapshot.likes,
        comments: snapshot.comments,
        shares: snapshot.shares,
        saves: snapshot.saves,
      }))
      .sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    return {
      campaignId: analytics.campaignId,
      campaignMetadata: {
        campaignId: analytics.campaignId,
        name: analytics.campaignName,
        artist: analytics.artist,
        song: analytics.song,
      },
      totals: {
        posts: totalPosts,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        saves: totalSaves,
      },
      dailyData,
      lastUpdatedAt: analytics._creationTime,
    };
  },
});

export const getTopVideosByPostDate = query({
  args: {
    campaignId: v.string(),
    dates: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { campaignId, dates }) => {
    // Helper: Convert DD-MM-YYYY to Unix timestamp range (start and end of day)
    const dateStringToTimestampRange = (dateStr: string): [number, number] => {
      const parts = dateStr.split('-').map(Number);
      const day = parts[0] ?? 1;
      const month = parts[1] ?? 1;
      const year = parts[2] ?? 2000;
      const startOfDay = new Date(year, month - 1, day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day);
      endOfDay.setHours(23, 59, 59, 999);
      return [Math.floor(startOfDay.getTime() / 1000), Math.floor(endOfDay.getTime() / 1000)];
    };

    // Query all posts for this campaign
    const bundlePosts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Get valid postIds from airtableContents
    const airtablePosts = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter to only include posts that exist in airtableContents
    const airtablePostIds = new Set(airtablePosts.map((item) => item.postId));
    let filteredPosts = bundlePosts.filter((post) => airtablePostIds.has(post.postId));

    if (campaignId === "recfMqIdSjfY7Q2kW" || campaignId === "recC4ugPAbpnncm8q") {
      filteredPosts = filteredPosts.filter((post: Doc<"bundleSocialPostedVideos">) => post.views > 0);
    }

    // If dates are provided and not empty, filter by those dates
    if (dates && dates.length > 0) {
      // Convert dates to timestamp ranges
      const timestampRanges = dates.map(dateStringToTimestampRange);

      // Filter posts where postedAt falls within any of the date ranges
      filteredPosts = filteredPosts.filter((post) => {
        return timestampRanges.some(([start, end]) => {
          return post.postedAt >= start && post.postedAt <= end;
        });
      });
    }

    // Sort by views descending and take top 100
    const topVideos = filteredPosts
      .sort((a, b) => b.views - a.views)
      .slice(0, 100)
      .map((post) => ({
        videoId: post.videoId,
        postId: post.postId,
        postedAt: post.postedAt,
        videoUrl: post.videoUrl,
        mediaUrl: post.mediaUrl,
        views: post.views,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        saves: post.saves,
      }));

    return topVideos;
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

export const getTikTokVideosByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("tiktokVideos")
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
    dailySnapshotsByDate: v.record(v.string(), v.object({
      totalPosts: v.number(),
      totalViews: v.number(),
      totalLikes: v.number(),
      totalComments: v.number(),
      totalShares: v.number(),
      totalSaves: v.number(),
      dailySnapshots: v.record(v.string(), v.object({
        totalViews: v.number(),
        totalLikes: v.number(),
        totalComments: v.number(),
        totalShares: v.number(),
        totalSaves: v.number(),
      })),
    })),
    dailySnapshots: v.record(v.string(), v.object({
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
        dailySnapshotsByDate: args.dailySnapshotsByDate,
        dailySnapshots: args.dailySnapshots,
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
        dailySnapshotsByDate: args.dailySnapshotsByDate,
        dailySnapshots: args.dailySnapshots,
      });
    }
  },
});

export const calculateCampaignAnalyticsByCampaign = internalAction({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.runQuery(internal.app.analytics.getCampaignById, { campaignId });
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const bundlePosts: Doc<"bundleSocialPostedVideos">[] = await ctx.runQuery(internal.app.analytics.getBundleSocialPostsByCampaign, { campaignId });
    const airtablePosts: Doc<"airtableContents">[] = await ctx.runQuery(internal.app.analytics.getAirtablePostsByCampaign, { campaignId });
    const bundleSnapshots: Doc<"bundleSocialSnapshots">[] = await ctx.runQuery(internal.app.analytics.getSnapshotsByCampaign, { campaignId });
    const tiktokVideos: Doc<"tiktokVideos">[] = await ctx.runQuery(internal.app.analytics.getTikTokVideosByCampaign, { campaignId });

    // Only include bundlePosts that have a matching postId in airtablePosts
    const airtablePostIds = new Set(airtablePosts.map((item: Doc<"airtableContents">) => item.postId));
    let posts: Doc<"bundleSocialPostedVideos">[] = bundlePosts.filter((post: Doc<"bundleSocialPostedVideos">) => airtablePostIds.has(post.postId));
    const snapshots: Doc<"bundleSocialSnapshots">[] = bundleSnapshots.filter((snapshot: Doc<"bundleSocialSnapshots">) => airtablePostIds.has(snapshot.postId));

    // Append tiktok videos to posts (skip if videoId already exists)
    const existingVideoIds = new Set(posts.map((post: Doc<"bundleSocialPostedVideos">) => post.videoId));
    const tiktokPostsToAdd = tiktokVideos
      .filter((video: Doc<"tiktokVideos">) => !existingVideoIds.has(video.videoId))
      .map((video: Doc<"tiktokVideos">) => ({
        _id: video._id as any,
        _creationTime: video._creationTime,
        campaignId: video.campaignId || campaignId,
        postId: video.videoId, // Use videoId as postId since tiktokVideos doesn't have postId
        videoId: video.videoId,
        postedAt: video.createTime,
        videoUrl: video.videoUrl,
        mediaUrl: video.videoUrl, // Use videoUrl as mediaUrl
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        shares: video.shares,
        saves: video.saves,
        updatedAt: video.createTime,
      } as Doc<"bundleSocialPostedVideos">));

    posts.push(...tiktokPostsToAdd);

    if (campaignId === "recfMqIdSjfY7Q2kW" || campaignId === "recC4ugPAbpnncm8q") {
      posts = posts.filter((post: Doc<"bundleSocialPostedVideos">) => post.views > 0);
    }

    const totalPosts: number = posts.length;
    const totalViews: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.views, 0);
    const totalLikes: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.likes, 0);
    const totalComments: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.comments, 0);
    const totalShares: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.shares, 0);
    const totalSaves: number = posts.reduce((acc: number, post: Doc<"bundleSocialPostedVideos">) => acc + post.saves, 0);

    // Forward fill snapshots to ensure no gaps in data for each post
    // Also backfill posts that have no snapshots using their current values
    const forwardFilledSnapshots = forwardFillSnapshots(snapshots, posts);

    // Calculate daily totals grouped by post date
    // This provides complete analytics for posts published on each date
    const dailySnapshotsByDate = calculateDailyTotalSnapshotsByPostDate(forwardFilledSnapshots, posts);

    // Calculate flat daily snapshots (aggregated across all posts)
    const dailySnapshots = calculateDailyTotalSnapshots(forwardFilledSnapshots);

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
      dailySnapshotsByDate,
      dailySnapshots,
    });

    return {
      campaignId,
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      dailySnapshotsByDate,
      dailySnapshots,
    };
  },
});

export const calculateCampaignAnalytics = internalAction({
  handler: async (ctx) => {
    const campaignIds = await ctx.runQuery(internal.app.bundle.getUniqueCampaignIdsFromAirtable, {});
    let scheduledCount = 0;

    for (const campaignId of campaignIds) {
      // Schedule background job for this campaign
      await ctx.scheduler.runAfter(0, internal.app.analytics.calculateCampaignAnalyticsByCampaign, {
        campaignId,
      });

      scheduledCount++;
    }

    console.log(`${scheduledCount} campaigns scheduled for processing`);
  },
});