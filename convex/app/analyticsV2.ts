import { v } from "convex/values";
import { TableAggregate } from "@convex-dev/aggregate";
import { Triggers } from "convex-helpers/server/triggers";
import { components, internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { fetchVideoDetails } from "./tiktok";

// =============================================================================
// CONSTANTS
// =============================================================================

const BUNDLE_SOCIAL_API_KEY = process.env.BUNDLE_SOCIAL_API_KEY!;
const CHUNK_SIZE = 1000; // Airtable contents per action invocation
const CONCURRENCY = 5; // Parallel HTTP requests within a chunk
const POPULATE_STAGGER_MS = 0.1 * 60 * 1000; // 5 minutes between campaigns

// =============================================================================
// AGGREGATES
// =============================================================================

export const aggregateViews = new TableAggregate<{
  Namespace: string;
  Key: [number];
  DataModel: DataModel;
  TableName: "tiktokVideoStats";
}>(components.aggregateViews, {
  namespace: (doc) => doc.campaignId,
  sortKey: (doc) => [-doc.postedAt],
  sumValue: (doc) => doc.views,
});

export const aggregateLikes = new TableAggregate<{
  Namespace: string;
  Key: [number];
  DataModel: DataModel;
  TableName: "tiktokVideoStats";
}>(components.aggregateLikes, {
  namespace: (doc) => doc.campaignId,
  sortKey: (doc) => [-doc.postedAt],
  sumValue: (doc) => doc.likes,
});

export const aggregateComments = new TableAggregate<{
  Namespace: string;
  Key: [number];
  DataModel: DataModel;
  TableName: "tiktokVideoStats";
}>(components.aggregateComments, {
  namespace: (doc) => doc.campaignId,
  sortKey: (doc) => [-doc.postedAt],
  sumValue: (doc) => doc.comments,
});

export const aggregateShares = new TableAggregate<{
  Namespace: string;
  Key: [number];
  DataModel: DataModel;
  TableName: "tiktokVideoStats";
}>(components.aggregateShares, {
  namespace: (doc) => doc.campaignId,
  sortKey: (doc) => [-doc.postedAt],
  sumValue: (doc) => doc.shares,
});

export const aggregateSaves = new TableAggregate<{
  Namespace: string;
  Key: [number];
  DataModel: DataModel;
  TableName: "tiktokVideoStats";
}>(components.aggregateSaves, {
  namespace: (doc) => doc.campaignId,
  sortKey: (doc) => [-doc.postedAt],
  sumValue: (doc) => doc.saves,
});

// =============================================================================
// TRIGGERS
// =============================================================================

const triggers = new Triggers<DataModel>();
triggers.register("tiktokVideoStats", aggregateViews.trigger());
triggers.register("tiktokVideoStats", aggregateLikes.trigger());
triggers.register("tiktokVideoStats", aggregateComments.trigger());
triggers.register("tiktokVideoStats", aggregateShares.trigger());
triggers.register("tiktokVideoStats", aggregateSaves.trigger());

// =============================================================================
// HELPER FUNCTIONS (private)
// =============================================================================

interface BundleSocialPostResult {
  tiktokVideoId: string;
  postedAt: number;
  mediaUrl: string;
}

async function fetchBundleSocialPost(
  postId: string,
): Promise<BundleSocialPostResult | null> {
  try {
    const response = await fetch(
      `https://api.bundle.social/api/v1/analytics/post?platformType=TIKTOK&postId=${postId}`,
      {
        headers: {
          "x-api-key": BUNDLE_SOCIAL_API_KEY,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const tiktokId = data?.post?.externalData?.TIKTOK?.id;
    const permalink = data?.post?.externalData?.TIKTOK?.permalink;
    const postedDate = data?.post?.postedDate;

    if (!tiktokId) {
      return null;
    }

    return {
      tiktokVideoId: tiktokId,
      postedAt: postedDate ? Math.floor(new Date(postedDate).getTime() / 1000) : 0,
      mediaUrl: permalink || "",
    };
  } catch {
    return null;
  }
}

function getHourlyIntervalId(prefix: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  return `${prefix}_${year}${month}${day}${hour}`;
}

function getSnapshotAt(): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const hour = now.getUTCHours();
  return year * 1000000 + month * 10000 + day * 100 + hour;
}

// =============================================================================
// INTERNAL QUERIES
// =============================================================================

export const getExistingVideoIds = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const videos = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
    return {
      tiktokVideoIds: videos.map((v) => v.tiktokVideoId),
      bundlePostIds: videos
        .map((v) => v.bundlePostId)
        .filter((id): id is string => !!id),
    };
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

export const getAggregateTotals = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const [viewsResult, likesResult, commentsResult, sharesResult, savesResult] =
      await Promise.all([
        aggregateViews.sum(ctx, { namespace: campaignId, bounds: {} }),
        aggregateLikes.sum(ctx, { namespace: campaignId, bounds: {} }),
        aggregateComments.sum(ctx, { namespace: campaignId, bounds: {} }),
        aggregateShares.sum(ctx, { namespace: campaignId, bounds: {} }),
        aggregateSaves.sum(ctx, { namespace: campaignId, bounds: {} }),
      ]);

    const totalPosts = await aggregateViews.count(ctx, {
      namespace: campaignId,
      bounds: {},
    });

    return {
      totalPosts,
      totalViews: viewsResult,
      totalLikes: likesResult,
      totalComments: commentsResult,
      totalShares: sharesResult,
      totalSaves: savesResult,
    };
  },
});

export const getAllCampaignIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    return [...new Set(campaigns.map((c) => c.campaignId))];
  },
});

export const getActiveCampaigns = internalQuery({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();

    return campaigns.map((c) => c.campaignId);
  },
});

export const getVideosByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const videos = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Group by tiktokAuthorId -> [tiktokVideoId]
    const result: Record<string, string[]> = {};
    for (const video of videos) {
      if (!result[video.tiktokAuthorId]) {
        result[video.tiktokAuthorId] = [];
      }
      result[video.tiktokAuthorId]!.push(video.tiktokVideoId);
    }
    return result;
  },
});

export const getCampaignsWithMinViewsFilter = internalQuery({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    return campaigns.filter(
      (c) => c.minViewsFilter !== undefined && c.minViewsFilter > 0,
    );
  },
});

// =============================================================================
// TRIGGER-WRAPPED MUTATIONS (write to tiktokVideoStats)
// =============================================================================

export const upsertVideoStats = internalMutation({
  args: {
    videos: v.array(
      v.object({
        campaignId: v.string(),
        tiktokAuthorId: v.string(),
        tiktokVideoId: v.string(),
        mediaUrl: v.string(),
        postedAt: v.number(),
        views: v.number(),
        likes: v.number(),
        comments: v.number(),
        shares: v.number(),
        saves: v.number(),
        isManual: v.boolean(),
        bundlePostId: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { videos }) => {
    const { db } = triggers.wrapDB(ctx);
    let inserted = 0;
    let updated = 0;

    for (const video of videos) {
      const existing = await db
        .query("tiktokVideoStats")
        .withIndex("by_tiktokVideoId", (q) =>
          q.eq("tiktokVideoId", video.tiktokVideoId),
        )
        .first();

      if (existing) {
        await db.patch(existing._id, {
          views: video.views,
          likes: video.likes,
          comments: video.comments,
          shares: video.shares,
          saves: video.saves,
          tiktokAuthorId: video.tiktokAuthorId,
          mediaUrl: video.mediaUrl,
          ...(video.bundlePostId && !existing.bundlePostId
            ? { bundlePostId: video.bundlePostId }
            : {}),
        });
        updated++;
      } else {
        await db.insert("tiktokVideoStats", video);
        inserted++;
      }
    }

    return { inserted, updated };
  },
});

const videoStatsUpdateValidator = v.object({
  tiktokVideoId: v.string(),
  views: v.number(),
  likes: v.number(),
  comments: v.number(),
  shares: v.number(),
  saves: v.number(),
});

export const scheduleVideoStatsUpdates = internalMutation({
  args: {
    videos: v.array(videoStatsUpdateValidator),
  },
  handler: async (ctx, { videos }) => {
    for (const video of videos) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.analyticsV2.processOneVideoStatsUpdate,
        video,
      );
    }
  },
});

export const processOneVideoStatsUpdate = internalMutation({
  args: videoStatsUpdateValidator,
  handler: async (ctx, args) => {
    const { db } = triggers.wrapDB(ctx);

    const existing = await db
      .query("tiktokVideoStats")
      .withIndex("by_tiktokVideoId", (q) =>
        q.eq("tiktokVideoId", args.tiktokVideoId),
      )
      .first();

    if (!existing) return;

    await db.patch(existing._id, {
      views: args.views,
      likes: args.likes,
      comments: args.comments,
      shares: args.shares,
      saves: args.saves,
    });

    // Create/update hourly snapshot inline (no separate batch scheduling)
    const intervalId = getHourlyIntervalId(args.tiktokVideoId);
    const snapshotAt = getSnapshotAt();
    const hour = new Date().getUTCHours();

    const existingSnapshot = await ctx.db
      .query("tiktokVideoSnapshots")
      .withIndex("by_intervalId", (q) => q.eq("intervalId", intervalId))
      .first();

    if (existingSnapshot) {
      await ctx.db.patch(existingSnapshot._id, {
        views: args.views,
        likes: args.likes,
        comments: args.comments,
        shares: args.shares,
        saves: args.saves,
      });
    } else {
      await ctx.db.insert("tiktokVideoSnapshots", {
        tiktokVideoId: args.tiktokVideoId,
        intervalId,
        snapshotAt,
        hour,
        views: args.views,
        likes: args.likes,
        comments: args.comments,
        shares: args.shares,
        saves: args.saves,
      });
    }
  },
});

// =============================================================================
// REGULAR INTERNAL MUTATIONS
// =============================================================================

export const upsertVideoSnapshots = internalMutation({
  args: {
    tiktokVideoId: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
  },
  handler: async (ctx, args) => {
    const intervalId = getHourlyIntervalId(args.tiktokVideoId);
    const snapshotAt = getSnapshotAt();
    const hour = new Date().getUTCHours();

    const existing = await ctx.db
      .query("tiktokVideoSnapshots")
      .withIndex("by_intervalId", (q) => q.eq("intervalId", intervalId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        views: args.views,
        likes: args.likes,
        comments: args.comments,
        shares: args.shares,
        saves: args.saves,
      });
    } else {
      await ctx.db.insert("tiktokVideoSnapshots", {
        tiktokVideoId: args.tiktokVideoId,
        intervalId,
        snapshotAt,
        hour,
        views: args.views,
        likes: args.likes,
        comments: args.comments,
        shares: args.shares,
        saves: args.saves,
      });
    }
  },
});

export const upsertVideoSnapshotsBatch = internalMutation({
  args: {
    tiktokVideoIds: v.array(v.string()),
  },
  handler: async (ctx, { tiktokVideoIds }) => {
    const hour = new Date().getUTCHours();
    const snapshotAt = getSnapshotAt();

    for (const tiktokVideoId of tiktokVideoIds) {
      const video = await ctx.db
        .query("tiktokVideoStats")
        .withIndex("by_tiktokVideoId", (q) =>
          q.eq("tiktokVideoId", tiktokVideoId),
        )
        .first();

      if (!video) continue;

      const intervalId = getHourlyIntervalId(tiktokVideoId);
      const existing = await ctx.db
        .query("tiktokVideoSnapshots")
        .withIndex("by_intervalId", (q) => q.eq("intervalId", intervalId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          views: video.views,
          likes: video.likes,
          comments: video.comments,
          shares: video.shares,
          saves: video.saves,
        });
      } else {
        await ctx.db.insert("tiktokVideoSnapshots", {
          tiktokVideoId,
          intervalId,
          snapshotAt,
          hour,
          views: video.views,
          likes: video.likes,
          comments: video.comments,
          shares: video.shares,
          saves: video.saves,
        });
      }
    }
  },
});

export const writeCampaignSnapshot = internalMutation({
  args: {
    campaignId: v.string(),
    platform: v.union(v.literal("tiktok"), v.literal("instagram")),
    totalPosts: v.number(),
    totalViews: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalShares: v.number(),
    totalSaves: v.number(),
  },
  handler: async (ctx, args) => {
    const intervalId = getHourlyIntervalId(args.campaignId) + `_${args.platform}`;
    const snapshotAt = getSnapshotAt();
    const hour = new Date().getUTCHours();

    const existing = await ctx.db
      .query("campaignSnapshots")
      .withIndex("by_intervalId", (q) => q.eq("intervalId", intervalId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalPosts: args.totalPosts,
        totalViews: args.totalViews,
        totalLikes: args.totalLikes,
        totalComments: args.totalComments,
        totalShares: args.totalShares,
        totalSaves: args.totalSaves,
      });
    } else {
      await ctx.db.insert("campaignSnapshots", {
        campaignId: args.campaignId,
        intervalId,
        snapshotAt,
        hour,
        platform: args.platform,
        totalPosts: args.totalPosts,
        totalViews: args.totalViews,
        totalLikes: args.totalLikes,
        totalComments: args.totalComments,
        totalShares: args.totalShares,
        totalSaves: args.totalSaves,
      });
    }
  },
});

export const calculateMinViewsExcludedStats = internalMutation({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) return;

    const minViewsFilter = campaign.minViewsFilter ?? 0;

    if (minViewsFilter <= 0) {
      // Reset excluded stats to zero
      await ctx.db.patch(campaign._id, {
        minViewsExcludedStats: {
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalSaves: 0,
        },
      });
      return;
    }

    // Get all videos below the threshold
    const videos = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const excluded = videos.filter((v) => v.views < minViewsFilter);

    const excludedStats = {
      totalPosts: excluded.length,
      totalViews: excluded.reduce((sum, v) => sum + v.views, 0),
      totalLikes: excluded.reduce((sum, v) => sum + v.likes, 0),
      totalComments: excluded.reduce((sum, v) => sum + v.comments, 0),
      totalShares: excluded.reduce((sum, v) => sum + v.shares, 0),
      totalSaves: excluded.reduce((sum, v) => sum + v.saves, 0),
    };

    await ctx.db.patch(campaign._id, {
      minViewsExcludedStats: excludedStats,
    });
  },
});

// =============================================================================
// USER-FACING MUTATIONS
// =============================================================================

export const updateMinViewsFilter = mutation({
  args: {
    campaignId: v.string(),
    minViewsFilter: v.number(),
  },
  handler: async (ctx, { campaignId, minViewsFilter }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    await ctx.db.patch(campaign._id, { minViewsFilter });

    // Schedule recalculation of excluded stats
    await ctx.scheduler.runAfter(
      0,
      internal.app.analyticsV2.calculateMinViewsExcludedStats,
      { campaignId },
    );

    return { success: true };
  },
});

export const updateCampaignSettings = mutation({
  args: {
    campaignId: v.string(),
    currencySymbol: v.optional(v.union(v.literal("USD"), v.literal("GBP"))),
    manualCpmMultiplier: v.optional(v.number()),
    apiCpmMultiplier: v.optional(v.number()),
  },
  handler: async (ctx, { campaignId, ...updates }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const patchData: Record<string, unknown> = {};
    if (updates.currencySymbol !== undefined)
      patchData.currencySymbol = updates.currencySymbol;
    if (updates.manualCpmMultiplier !== undefined)
      patchData.manualCpmMultiplier = updates.manualCpmMultiplier;
    if (updates.apiCpmMultiplier !== undefined)
      patchData.apiCpmMultiplier = updates.apiCpmMultiplier;

    await ctx.db.patch(campaign._id, patchData);
    return { success: true };
  },
});

export const pushContentSamplesV2 = mutation({
  args: {
    campaignId: v.string(),
    samples: v.array(
      v.object({
        videoUrl: v.string(),
        thumbnailUrl: v.string(),
        sourceVideoId: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { campaignId, samples }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const existingSamples = campaign.contentSamples ?? [];
    const existingSourceIds = new Set(
      existingSamples
        .map((s) => s.sourceVideoId)
        .filter((id): id is string => !!id),
    );
    const existingVideoUrls = new Set(existingSamples.map((s) => s.videoUrl));

    const newSamples = samples.filter((sample) => {
      if (sample.sourceVideoId && existingSourceIds.has(sample.sourceVideoId))
        return false;
      if (existingVideoUrls.has(sample.videoUrl)) return false;
      return true;
    });

    if (newSamples.length === 0) {
      return {
        success: true,
        addedCount: 0,
        skippedCount: samples.length,
        totalCount: existingSamples.length,
      };
    }

    const samplesWithTimestamp = newSamples.map((sample) => ({
      ...sample,
      addedAt: Date.now(),
    }));

    const updatedSamples = [...existingSamples, ...samplesWithTimestamp];
    await ctx.db.patch(campaign._id, { contentSamples: updatedSamples });

    return {
      success: true,
      addedCount: newSamples.length,
      skippedCount: samples.length - newSamples.length,
      totalCount: updatedSamples.length,
    };
  },
});

export const removeContentSamplesV2 = mutation({
  args: {
    campaignId: v.string(),
    indicesToRemove: v.array(v.number()),
  },
  handler: async (ctx, { campaignId, indicesToRemove }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const existingSamples = campaign.contentSamples ?? [];
    const indicesToRemoveSet = new Set(indicesToRemove);
    const updatedSamples = existingSamples.filter(
      (_, index) => !indicesToRemoveSet.has(index),
    );

    await ctx.db.patch(campaign._id, { contentSamples: updatedSamples });

    return {
      success: true,
      removedCount: indicesToRemove.length,
      remainingCount: updatedSamples.length,
    };
  },
});

// =============================================================================
// CONTENT SAMPLES
// =============================================================================

export const getContentSamplesV2 = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) {
      return [];
    }

    return campaign.contentSamples ?? [];
  },
});

// =============================================================================
// ANALYTICS OVERVIEW
// =============================================================================

/**
 * Get all campaigns with analytics for the overview page.
 * Returns campaign metadata, totals, and last 14 days of sparkline data.
 * V2 replacement for analytics.getAllCampaignsWithAnalytics.
 */
export const getAllCampaignsWithAnalyticsV2 = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, { status }) => {
    let allCampaigns;
    if (status) {
      allCampaigns = await ctx.db
        .query("campaigns")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    } else {
      allCampaigns = await ctx.db.query("campaigns").collect();
    }

    // Calculate date range for last 14 days of snapshots
    const now = new Date();
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);
    // snapshotAt format is YYYYMMDDHH
    const minSnapshotAt = fourteenDaysAgo.getFullYear() * 1000000 +
      (fourteenDaysAgo.getMonth() + 1) * 10000 +
      fourteenDaysAgo.getDate() * 100;

    const results = await Promise.all(
      allCampaigns.map(async (campaign) => {
        // Get the earliest video posted date for this campaign
        const firstVideo = await ctx.db
          .query("tiktokVideoStats")
          .withIndex("by_campaignId_postedAt", (q) =>
            q.eq("campaignId", campaign.campaignId),
          )
          .order("asc")
          .first();

        // Get real-time aggregate totals (same approach as getCampaignAnalyticsV2)
        const [views, likes, comments, shares, saves] = await Promise.all([
          aggregateViews.sum(ctx, { namespace: campaign.campaignId, bounds: {} }),
          aggregateLikes.sum(ctx, { namespace: campaign.campaignId, bounds: {} }),
          aggregateComments.sum(ctx, { namespace: campaign.campaignId, bounds: {} }),
          aggregateShares.sum(ctx, { namespace: campaign.campaignId, bounds: {} }),
          aggregateSaves.sum(ctx, { namespace: campaign.campaignId, bounds: {} }),
        ]);
        const totalPosts = await aggregateViews.count(ctx, {
          namespace: campaign.campaignId,
          bounds: {},
        });

        // Subtract excluded stats (videos below min-views threshold)
        const excluded = campaign.minViewsExcludedStats ?? {
          totalPosts: 0, totalViews: 0, totalLikes: 0,
          totalComments: 0, totalShares: 0, totalSaves: 0,
        };

        // Get recent snapshots for sparkline
        const snapshots = await ctx.db
          .query("campaignSnapshots")
          .withIndex("by_campaignId", (q) => q.eq("campaignId", campaign.campaignId))
          .collect();

        // Filter to last 14 days and group by date (YYYYMMDD)
        const recentSnapshots = snapshots.filter((s) => s.snapshotAt >= minSnapshotAt);
        const byDate = new Map<number, typeof recentSnapshots[0]>();
        for (const snap of recentSnapshots) {
          const dateKey = Math.floor(snap.snapshotAt / 100); // YYYYMMDD
          const existing = byDate.get(dateKey);
          // Take the latest snapshot per day (highest snapshotAt)
          if (!existing || snap.snapshotAt > existing.snapshotAt) {
            byDate.set(dateKey, snap);
          }
        }

        // Convert to sparkline data sorted by date
        const sparklineData = Array.from(byDate.entries())
          .sort(([a], [b]) => a - b)
          .slice(-14)
          .map(([dateKey, snap]) => {
            // Convert YYYYMMDD to DD-MM-YYYY format for consistency
            const year = Math.floor(dateKey / 10000);
            const month = Math.floor((dateKey % 10000) / 100);
            const day = dateKey % 100;
            const dateStr = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
            return {
              date: dateStr,
              views: snap.totalViews,
              likes: snap.totalLikes,
              comments: snap.totalComments,
              shares: snap.totalShares,
            };
          });

        return {
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
          artist: campaign.artist,
          song: campaign.song,
          status: campaign.status,
          totals: {
            posts: totalPosts - excluded.totalPosts,
            views: views - excluded.totalViews,
            likes: likes - excluded.totalLikes,
            comments: comments - excluded.totalComments,
            shares: shares - excluded.totalShares,
            saves: saves - excluded.totalSaves,
          },
          sparklineData,
          firstVideoAt: firstVideo?.postedAt ?? null,
          lastUpdatedAt: campaign._creationTime,
        };
      }),
    );

    return results;
  },
});

// =============================================================================
// USER-FACING QUERIES
// =============================================================================

export const getCampaignAnalyticsV2 = query({
  args: {
    campaignId: v.string(),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    platform: v.optional(v.union(v.literal("all"), v.literal("tiktok"), v.literal("instagram"))),
  },
  handler: async (ctx, { campaignId, dateFrom, dateTo, platform = "all" }) => {
    // Read campaign record for settings and excluded stats
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const settingsMinViewsFilter = campaign?.minViewsFilter ?? 0;
    const hasDateFilter = dateFrom !== undefined || dateTo !== undefined;

    let totalPosts = 0;
    let viewsResult = 0;
    let likesResult = 0;
    let commentsResult = 0;
    let sharesResult = 0;
    let savesResult = 0;

    // --- TikTok totals ---
    if (platform === "all" || platform === "tiktok") {
      if (hasDateFilter) {
        let videos = await ctx.db
          .query("tiktokVideoStats")
          .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
          .collect();

        if (settingsMinViewsFilter > 0) {
          videos = videos.filter((v) => v.views >= settingsMinViewsFilter);
        }
        if (dateFrom !== undefined) {
          videos = videos.filter((v) => v.postedAt >= dateFrom);
        }
        if (dateTo !== undefined) {
          videos = videos.filter((v) => v.postedAt <= dateTo);
        }

        totalPosts += videos.length;
        viewsResult += videos.reduce((sum, v) => sum + v.views, 0);
        likesResult += videos.reduce((sum, v) => sum + v.likes, 0);
        commentsResult += videos.reduce((sum, v) => sum + v.comments, 0);
        sharesResult += videos.reduce((sum, v) => sum + v.shares, 0);
        savesResult += videos.reduce((sum, v) => sum + v.saves, 0);
      } else {
        const [views, likes, comments, shares, saves] = await Promise.all([
          aggregateViews.sum(ctx, { namespace: campaignId, bounds: {} }),
          aggregateLikes.sum(ctx, { namespace: campaignId, bounds: {} }),
          aggregateComments.sum(ctx, { namespace: campaignId, bounds: {} }),
          aggregateShares.sum(ctx, { namespace: campaignId, bounds: {} }),
          aggregateSaves.sum(ctx, { namespace: campaignId, bounds: {} }),
        ]);

        const ttPosts = await aggregateViews.count(ctx, {
          namespace: campaignId,
          bounds: {},
        });

        totalPosts += ttPosts;
        viewsResult += views;
        likesResult += likes;
        commentsResult += comments;
        sharesResult += shares;
        savesResult += saves;
      }
    }

    // --- Instagram totals ---
    if (platform === "all" || platform === "instagram") {
      let igPosts = await ctx.db
        .query("instagramPostStats")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect();

      if (dateFrom !== undefined) {
        igPosts = igPosts.filter((p) => p.postedAt >= dateFrom);
      }
      if (dateTo !== undefined) {
        igPosts = igPosts.filter((p) => p.postedAt <= dateTo);
      }

      totalPosts += igPosts.length;
      viewsResult += igPosts.reduce((sum, p) => sum + p.views, 0);
      likesResult += igPosts.reduce((sum, p) => sum + p.likes, 0);
      commentsResult += igPosts.reduce((sum, p) => sum + p.comments, 0);
      // Instagram has no shares/saves
    }

    const excluded = hasDateFilter || platform === "instagram"
      ? { totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalSaves: 0 }
      : (platform === "tiktok"
        ? (campaign?.minViewsExcludedStats ?? {
            totalPosts: 0, totalViews: 0, totalLikes: 0,
            totalComments: 0, totalShares: 0, totalSaves: 0,
          })
        : (campaign?.minViewsExcludedStats ?? {
            totalPosts: 0, totalViews: 0, totalLikes: 0,
            totalComments: 0, totalShares: 0, totalSaves: 0,
          }));

    return {
      campaignId,
      campaignName: campaign?.campaignName ?? "",
      artist: campaign?.artist ?? "",
      song: campaign?.song ?? "",
      platform,
      aggregateTotals: {
        totalPosts,
        totalViews: viewsResult,
        totalLikes: likesResult,
        totalComments: commentsResult,
        totalShares: sharesResult,
        totalSaves: savesResult,
      },
      adjustedTotals: {
        totalPosts: totalPosts - excluded.totalPosts,
        totalViews: viewsResult - excluded.totalViews,
        totalLikes: likesResult - excluded.totalLikes,
        totalComments: commentsResult - excluded.totalComments,
        totalShares: sharesResult - excluded.totalShares,
        totalSaves: savesResult - excluded.totalSaves,
      },
      minViewsExcludedStats: excluded,
      settings: {
        minViewsFilter: campaign?.minViewsFilter ?? 0,
        currencySymbol: campaign?.currencySymbol ?? ("USD" as const),
        manualCpmMultiplier: campaign?.manualCpmMultiplier ?? 1,
        apiCpmMultiplier: campaign?.apiCpmMultiplier ?? 0.5,
      },
      contentSamples: campaign?.contentSamples ?? [],
    };
  },
});

export const getVideoPerformanceV2 = query({
  args: {
    campaignId: v.string(),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
    minViews: v.optional(v.number()),
    maxViews: v.optional(v.number()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    isManualOnly: v.optional(v.boolean()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    platform: v.optional(v.union(v.literal("all"), v.literal("tiktok"), v.literal("instagram"))),
  },
  handler: async (
    ctx,
    {
      campaignId,
      offset = 0,
      limit = 10,
      minViews,
      maxViews,
      sortOrder = "desc",
      isManualOnly,
      dateFrom,
      dateTo,
      platform = "all",
    },
  ) => {
    // Get settings-level minViewsFilter
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const settingsMinViewsFilter = campaign?.minViewsFilter ?? 0;

    type UnifiedVideo = {
      _id: string;
      tiktokVideoId: string;
      tiktokAuthorId: string;
      mediaUrl: string;
      postedAt: number;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      isManual: boolean;
      platform: "tiktok" | "instagram";
      thumbnailUrl?: string | null;
    };

    const allVideos: UnifiedVideo[] = [];

    // --- TikTok videos ---
    if (platform === "all" || platform === "tiktok") {
      let videos = await ctx.db
        .query("tiktokVideoStats")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect();

      if (settingsMinViewsFilter > 0) {
        videos = videos.filter((v) => v.views >= settingsMinViewsFilter);
      }
      if (dateFrom !== undefined) {
        videos = videos.filter((v) => v.postedAt >= dateFrom);
      }
      if (dateTo !== undefined) {
        videos = videos.filter((v) => v.postedAt <= dateTo);
      }
      if (isManualOnly) {
        videos = videos.filter((v) => v.isManual === true);
      }

      for (const v of videos) {
        allVideos.push({
          _id: v._id,
          tiktokVideoId: v.tiktokVideoId,
          tiktokAuthorId: v.tiktokAuthorId,
          mediaUrl: v.mediaUrl,
          postedAt: v.postedAt,
          views: v.views,
          likes: v.likes,
          comments: v.comments,
          shares: v.shares,
          saves: v.saves,
          isManual: v.isManual,
          platform: "tiktok",
        });
      }
    }

    // --- Instagram posts ---
    if (platform === "all" || platform === "instagram") {
      let igPosts = await ctx.db
        .query("instagramPostStats")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect();

      if (dateFrom !== undefined) {
        igPosts = igPosts.filter((p) => p.postedAt >= dateFrom);
      }
      if (dateTo !== undefined) {
        igPosts = igPosts.filter((p) => p.postedAt <= dateTo);
      }

      for (const p of igPosts) {
        let thumbnailUrl: string | null = null;
        if (p.thumbnailStorageId) {
          thumbnailUrl = await ctx.storage.getUrl(p.thumbnailStorageId);
        }
        allVideos.push({
          _id: p._id,
          tiktokVideoId: p.instagramShortcode, // use shortcode as ID
          tiktokAuthorId: p.instagramUserId,
          mediaUrl: p.mediaUrl,
          postedAt: p.postedAt,
          views: p.views,
          likes: p.likes,
          comments: p.comments,
          shares: 0,
          saves: 0,
          isManual: false,
          platform: "instagram",
          thumbnailUrl,
        });
      }
    }

    // Apply user filters on unified list
    let filtered = allVideos;
    if (minViews !== undefined) {
      filtered = filtered.filter((v) => v.views >= minViews);
    }
    if (maxViews !== undefined) {
      filtered = filtered.filter((v) => v.views <= maxViews);
    }

    const totalCount = filtered.length;

    // Sort and paginate
    const sorted = filtered.sort((a, b) =>
      sortOrder === "desc" ? b.views - a.views : a.views - b.views,
    );

    const paginated = sorted.slice(offset, offset + limit);

    return {
      videos: paginated,
      totalCount,
      hasMore: offset + limit < totalCount,
    };
  },
});

export const getVideoSnapshots = query({
  args: { tiktokVideoId: v.string() },
  handler: async (ctx, { tiktokVideoId }) => {
    const snapshots = await ctx.db
      .query("tiktokVideoSnapshots")
      .withIndex("by_tiktokVideoId", (q) =>
        q.eq("tiktokVideoId", tiktokVideoId),
      )
      .collect();

    return snapshots
      .sort((a, b) => a.snapshotAt - b.snapshotAt)
      .slice(-48) // Last 48 hours
      .map((s) => ({
        snapshotAt: s.snapshotAt,
        views: s.views,
        likes: s.likes,
        comments: s.comments,
        shares: s.shares,
        saves: s.saves,
      }));
  },
});

export const getBatchVideoSnapshots = query({
  args: { tiktokVideoIds: v.array(v.string()) },
  handler: async (ctx, { tiktokVideoIds }) => {
    const result: Record<string, Array<{ snapshotAt: number; views: number; likes: number; comments: number; shares: number; saves: number }>> = {};

    await Promise.all(
      tiktokVideoIds.map(async (videoId) => {
        const snapshots = await ctx.db
          .query("tiktokVideoSnapshots")
          .withIndex("by_tiktokVideoId", (q) =>
            q.eq("tiktokVideoId", videoId),
          )
          .collect();

        result[videoId] = snapshots
          .sort((a, b) => a.snapshotAt - b.snapshotAt)
          .slice(-48)
          .map((s) => ({
            snapshotAt: s.snapshotAt,
            views: s.views,
            likes: s.likes,
            comments: s.comments,
            shares: s.shares,
            saves: s.saves,
          }));
      }),
    );

    return result;
  },
});

export const getCampaignSnapshots = query({
  args: {
    campaignId: v.string(),
    platform: v.optional(v.union(v.literal("all"), v.literal("tiktok"), v.literal("instagram"))),
  },
  handler: async (ctx, { campaignId, platform = "all" }) => {
    const allSnapshots = await ctx.db
      .query("campaignSnapshots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    if (platform === "tiktok" || platform === "instagram") {
      // Return only snapshots for the requested platform
      return allSnapshots
        .filter((s) => s.platform === platform)
        .sort((a, b) => a.snapshotAt - b.snapshotAt)
        .slice(-336)
        .map((s) => ({
          snapshotAt: s.snapshotAt,
          hour: s.hour,
          totalPosts: s.totalPosts,
          totalViews: s.totalViews,
          totalLikes: s.totalLikes,
          totalComments: s.totalComments,
          totalShares: s.totalShares,
          totalSaves: s.totalSaves,
        }));
    }

    // "all" — merge tiktok + instagram snapshots by snapshotAt
    const ttSnapshots = allSnapshots.filter((s) => s.platform === "tiktok");
    const igSnapshots = allSnapshots.filter((s) => s.platform === "instagram");

    // If no per-platform snapshots exist yet, fall back to legacy (no platform field)
    if (ttSnapshots.length === 0 && igSnapshots.length === 0) {
      return allSnapshots
        .filter((s) => !s.platform)
        .sort((a, b) => a.snapshotAt - b.snapshotAt)
        .slice(-336)
        .map((s) => ({
          snapshotAt: s.snapshotAt,
          hour: s.hour,
          totalPosts: s.totalPosts,
          totalViews: s.totalViews,
          totalLikes: s.totalLikes,
          totalComments: s.totalComments,
          totalShares: s.totalShares,
          totalSaves: s.totalSaves,
        }));
    }

    // Build a map keyed by snapshotAt, summing both platforms
    const merged = new Map<number, {
      snapshotAt: number;
      hour: number;
      totalPosts: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      totalSaves: number;
    }>();

    for (const s of [...ttSnapshots, ...igSnapshots]) {
      const existing = merged.get(s.snapshotAt);
      if (existing) {
        existing.totalPosts += s.totalPosts;
        existing.totalViews += s.totalViews;
        existing.totalLikes += s.totalLikes;
        existing.totalComments += s.totalComments;
        existing.totalShares += s.totalShares;
        existing.totalSaves += s.totalSaves;
      } else {
        merged.set(s.snapshotAt, {
          snapshotAt: s.snapshotAt,
          hour: s.hour,
          totalPosts: s.totalPosts,
          totalViews: s.totalViews,
          totalLikes: s.totalLikes,
          totalComments: s.totalComments,
          totalShares: s.totalShares,
          totalSaves: s.totalSaves,
        });
      }
    }

    return [...merged.values()]
      .sort((a, b) => a.snapshotAt - b.snapshotAt)
      .slice(-336);
  },
});

export const getDailySnapshotsByDate = query({
  args: {
    campaignId: v.string(),
    platform: v.optional(v.union(v.literal("all"), v.literal("tiktok"), v.literal("instagram"))),
  },
  handler: async (ctx, { campaignId, platform = "all" }) => {
    // Get settings-level minViewsFilter
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();
    const settingsMinViewsFilter = campaign?.minViewsFilter ?? 0;

    const byDate: Record<string, {
      totalPosts: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      totalSaves: number;
    }> = {};

    // --- TikTok ---
    if (platform === "all" || platform === "tiktok") {
      let videos = await ctx.db
        .query("tiktokVideoStats")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect();

      if (settingsMinViewsFilter > 0) {
        videos = videos.filter((v) => v.views >= settingsMinViewsFilter);
      }

      for (const video of videos) {
        const date = new Date(video.postedAt * 1000);
        const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

        if (!byDate[dateKey]) {
          byDate[dateKey] = { totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalSaves: 0 };
        }

        const entry = byDate[dateKey]!;
        entry.totalPosts++;
        entry.totalViews += video.views;
        entry.totalLikes += video.likes;
        entry.totalComments += video.comments;
        entry.totalShares += video.shares;
        entry.totalSaves += video.saves;
      }
    }

    // --- Instagram ---
    if (platform === "all" || platform === "instagram") {
      const igPosts = await ctx.db
        .query("instagramPostStats")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect();

      for (const post of igPosts) {
        const date = new Date(post.postedAt * 1000);
        const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

        if (!byDate[dateKey]) {
          byDate[dateKey] = { totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalSaves: 0 };
        }

        const entry = byDate[dateKey]!;
        entry.totalPosts++;
        entry.totalViews += post.views;
        entry.totalLikes += post.likes;
        entry.totalComments += post.comments;
        // Instagram has no shares/saves
      }
    }

    return Object.entries(byDate).map(([postDate, stats]) => ({
      postDate,
      ...stats,
    }));
  },
});

export const getCampaignAnalyticsSettingsV2 = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    return {
      minViewsFilter: campaign?.minViewsFilter ?? 0,
      currencySymbol: campaign?.currencySymbol ?? ("USD" as const),
      manualCpmMultiplier: campaign?.manualCpmMultiplier ?? 1,
      apiCpmMultiplier: campaign?.apiCpmMultiplier ?? 0.5,
    };
  },
});

// =============================================================================
// INTERNAL ACTIONS
// =============================================================================

export const populateTiktokVideoStats = internalAction({
  args: {
    campaignId: v.string(),
    offset: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { campaignId, offset = 0 },
  ): Promise<void> => {
    const airtableContents = await ctx.runQuery(
      internal.app.analyticsV2.getAirtablePostsByCampaign,
      { campaignId },
    );

    if (offset >= airtableContents.length) return;

    const { tiktokVideoIds, bundlePostIds } = await ctx.runQuery(
      internal.app.analyticsV2.getExistingVideoIds,
      { campaignId },
    );
    const existingSet = new Set(tiktokVideoIds);
    const existingPostIds = new Set(bundlePostIds);

    const chunk = airtableContents.slice(offset, offset + CHUNK_SIZE);

    // Pre-filter: skip items already tracked, collect items needing API calls
    type PendingItem = {
      postId?: string;
      tiktokId?: string;
      isManual: boolean;
    };
    const pending: PendingItem[] = [];
    for (const content of chunk) {
      const isManual = content.isManual ?? false;
      if (content.tiktokId) {
        if (!existingSet.has(content.tiktokId)) {
          pending.push({ tiktokId: content.tiktokId, isManual });
        }
      } else if (!isManual && content.postId) {
        // Skip if we already processed this Bundle post ID before
        if (!existingPostIds.has(content.postId)) {
          pending.push({ postId: content.postId, isManual });
        }
      }
    }

    // Process a single item: resolve tiktokVideoId + fetch stats
    type VideoResult = {
      campaignId: string;
      tiktokAuthorId: string;
      tiktokVideoId: string;
      mediaUrl: string;
      postedAt: number;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      isManual: boolean;
      bundlePostId?: string;
    };

    async function processItem(item: PendingItem): Promise<VideoResult | null> {
      let tiktokVideoId: string | null = item.tiktokId ?? null;
      let mediaUrl = "";
      let postedAt = 0;
      let bundlePostId: string | undefined = undefined;

      // Resolve tiktokVideoId via Bundle Social if needed
      if (!tiktokVideoId && item.postId) {
        const bundleResult = await fetchBundleSocialPost(item.postId);
        if (!bundleResult) return null;
        tiktokVideoId = bundleResult.tiktokVideoId;
        mediaUrl = bundleResult.mediaUrl;
        postedAt = bundleResult.postedAt;
        bundlePostId = item.postId;
      }

      if (!tiktokVideoId) return null;

      // If already tracked but resolved via Bundle Social, queue bundlePostId backfill
      if (existingSet.has(tiktokVideoId)) {
        if (bundlePostId) {
          bundlePostIdBackfills.push({ tiktokVideoId, bundlePostId });
        }
        return null;
      }

      // Fetch stats from Tokapi
      const details = await fetchVideoDetails(tiktokVideoId);
      if (!details) return null;

      return {
        campaignId,
        tiktokAuthorId: details.authorUid,
        tiktokVideoId,
        mediaUrl: mediaUrl || `https://www.tiktok.com/@/video/${tiktokVideoId}`,
        postedAt: postedAt || details.createTime,
        views: details.views,
        likes: details.likes,
        comments: details.comments,
        shares: details.shares,
        saves: details.saves,
        isManual: item.isManual,
        bundlePostId,
      };
    }

    // Collect bundlePostId backfills for existing stats that are missing it
    const bundlePostIdBackfills: Array<{ tiktokVideoId: string; bundlePostId: string }> = [];

    // Run in parallel batches of CONCURRENCY
    const videos: VideoResult[] = [];
    let errors = 0;

    for (let i = 0; i < pending.length; i += CONCURRENCY) {
      const batch = pending.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(batch.map(processItem));

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          videos.push(result.value);
          existingSet.add(result.value.tiktokVideoId);
        } else if (result.status === "rejected") {
          errors++;
        }
      }
    }

    // Fan out DB writes via scheduler in small batches to avoid OCC conflicts
    // (each batch writes to aggregate btree nodes independently)
    const DB_BATCH = 10;
    for (let i = 0; i < videos.length; i += DB_BATCH) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.analyticsV2.upsertVideoStats,
        { videos: videos.slice(i, i + DB_BATCH) },
      );
    }

    if (videos.length > 0) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.analyticsV2.upsertVideoSnapshotsBatch,
        { tiktokVideoIds: videos.map((v) => v.tiktokVideoId) },
      );
    }

    // Backfill bundlePostId on existing stats that are missing it
    if (bundlePostIdBackfills.length > 0) {
      const BACKFILL_BATCH = 25;
      for (let i = 0; i < bundlePostIdBackfills.length; i += BACKFILL_BATCH) {
        await ctx.scheduler.runAfter(
          0,
          internal.app.analyticsV2.backfillBundlePostIds,
          { items: bundlePostIdBackfills.slice(i, i + BACKFILL_BATCH) },
        );
      }
    }

    const skipped = chunk.length - pending.length;
    console.log(
      `[V2 Populate] Campaign ${campaignId} [${offset}..${offset + chunk.length - 1}/${airtableContents.length}]: ${videos.length} new, ${skipped} skipped, ${bundlePostIdBackfills.length} bundlePostId backfills, ${errors} errors (${pending.length} pending, ${CONCURRENCY} concurrency)`,
    );

    // Schedule next chunk
    const nextOffset = offset + CHUNK_SIZE;
    if (nextOffset < airtableContents.length) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.analyticsV2.populateTiktokVideoStats,
        { campaignId, offset: nextOffset },
      );
    }
  },
});

export const populateAllCampaigns = internalAction({
  args: { campaignId: v.optional(v.string()) },
  handler: async (ctx, { campaignId }) => {
    if (campaignId) {
      // Populate a single campaign immediately
      await ctx.scheduler.runAfter(
        0,
        internal.app.analyticsV2.populateTiktokVideoStats,
        { campaignId },
      );
      console.log(`[V2 Populate] Scheduled single campaign ${campaignId}`);
      return;
    }

    // Populate all campaigns with stagger
    const campaignIds = await ctx.runQuery(
      internal.app.analyticsV2.getAllCampaignIds,
      {},
    );

    let scheduled = 0;
    for (const id of campaignIds) {
      await ctx.scheduler.runAfter(
        scheduled * POPULATE_STAGGER_MS,
        internal.app.analyticsV2.populateTiktokVideoStats,
        { campaignId: id },
      );
      scheduled++;
    }

    console.log(
      `[V2 Populate] Scheduled ${scheduled} campaigns with ${POPULATE_STAGGER_MS / 1000}s stagger`,
    );
  },
});

export const snapshotSingleCampaign = internalAction({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // Read TikTok aggregate totals
    const ttTotals = await ctx.runQuery(
      internal.app.analyticsV2.getAggregateTotals,
      { campaignId },
    );

    // Read Instagram totals
    const igTotals = await ctx.runQuery(
      internal.app.instagramAnalytics.getInstagramTotals,
      { campaignId },
    );

    // Write per-platform snapshots
    await ctx.runMutation(internal.app.analyticsV2.writeCampaignSnapshot, {
      campaignId,
      platform: "tiktok",
      totalPosts: ttTotals.totalPosts,
      totalViews: ttTotals.totalViews,
      totalLikes: ttTotals.totalLikes,
      totalComments: ttTotals.totalComments,
      totalShares: ttTotals.totalShares,
      totalSaves: ttTotals.totalSaves,
    });

    await ctx.runMutation(internal.app.analyticsV2.writeCampaignSnapshot, {
      campaignId,
      platform: "instagram",
      totalPosts: igTotals.totalPosts,
      totalViews: igTotals.totalViews,
      totalLikes: igTotals.totalLikes,
      totalComments: igTotals.totalComments,
      totalShares: 0,
      totalSaves: 0,
    });
  },
});

export const snapshotCampaignStats = internalAction({
  args: {},
  handler: async (ctx) => {
    const campaignIds = await ctx.runQuery(
      internal.app.analyticsV2.getAllCampaignIds,
      {},
    );

    for (const campaignId of campaignIds) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.analyticsV2.snapshotSingleCampaign,
        { campaignId },
      );
    }

    console.log(
      `[V2 Snapshot] Scheduled snapshots for ${campaignIds.length} campaigns`,
    );
  },
});

// One-time backfill: patch legacy snapshots (no platform) to platform="tiktok".
// Processes in batches to stay under the 4096 read limit.
const BACKFILL_BATCH = 500;

export const backfillSnapshotPlatformBatch = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, { cursor }) => {
    const result = await ctx.db
      .query("campaignSnapshots")
      .paginate({ numItems: BACKFILL_BATCH, cursor: cursor ?? null });

    let patched = 0;
    for (const s of result.page) {
      if (!s.platform) {
        await ctx.db.patch(s._id, {
          platform: "tiktok",
          intervalId: s.intervalId + "_tiktok",
        });
        patched++;
      }
    }

    console.log(`[Backfill] Batch patched ${patched}/${result.page.length} rows, isDone=${result.isDone}`);
    return { patched, isDone: result.isDone, cursor: result.continueCursor };
  },
});

export const backfillSnapshotPlatform = internalAction({
  args: {},
  handler: async (ctx) => {
    let cursor: string | undefined;
    let totalPatched = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = await ctx.runMutation(
        internal.app.analyticsV2.backfillSnapshotPlatformBatch,
        { cursor },
      );
      totalPatched += result.patched;
      if (result.isDone) break;
      cursor = result.cursor;
    }

    console.log(`[Backfill] Done. Patched ${totalPatched} legacy snapshots to platform=tiktok`);
  },
});

export const recalculateAllMinViewsExcluded = internalAction({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.runQuery(
      internal.app.analyticsV2.getCampaignsWithMinViewsFilter,
      {},
    );

    for (const campaign of campaigns) {
      await ctx.runMutation(
        internal.app.analyticsV2.calculateMinViewsExcludedStats,
        { campaignId: campaign.campaignId },
      );
    }

    console.log(
      `[V2 MinViews] Recalculated excluded stats for ${campaigns.length} campaigns`,
    );
  },
});

// =============================================================================
// CAMPAIGN LIST CACHE (pre-computed totals for fast list page loading)
// =============================================================================

export const getFirstVideoAt = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const firstVideo = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId_postedAt", (q) =>
        q.eq("campaignId", campaignId),
      )
      .order("asc")
      .first();
    return firstVideo?.postedAt ?? null;
  },
});

export const updateCampaignCachedTotals = internalMutation({
  args: {
    campaignId: v.string(),
    rawTotals: v.object({
      totalPosts: v.number(),
      totalViews: v.number(),
      totalLikes: v.number(),
      totalComments: v.number(),
      totalShares: v.number(),
      totalSaves: v.number(),
    }),
    firstVideoAt: v.union(v.number(), v.null()),
  },
  handler: async (ctx, { campaignId, rawTotals, firstVideoAt }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) return;

    const excluded = campaign.minViewsExcludedStats ?? {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalSaves: 0,
    };

    await ctx.db.patch(campaign._id, {
      cachedTotals: {
        posts: rawTotals.totalPosts - excluded.totalPosts,
        views: rawTotals.totalViews - excluded.totalViews,
        likes: rawTotals.totalLikes - excluded.totalLikes,
        comments: rawTotals.totalComments - excluded.totalComments,
        shares: rawTotals.totalShares - excluded.totalShares,
        saves: rawTotals.totalSaves - excluded.totalSaves,
      },
      cachedFirstVideoAt: firstVideoAt ?? undefined,
      cachedAt: Date.now(),
    });
  },
});

export const cacheSingleCampaignTotals = internalAction({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const [ttTotals, igTotals, firstVideoAt] = await Promise.all([
      ctx.runQuery(internal.app.analyticsV2.getAggregateTotals, { campaignId }),
      ctx.runQuery(internal.app.instagramAnalytics.getInstagramTotals, { campaignId }),
      ctx.runQuery(internal.app.analyticsV2.getFirstVideoAt, { campaignId }),
    ]);

    // Combine TikTok + Instagram totals
    const rawTotals = {
      totalPosts: ttTotals.totalPosts + igTotals.totalPosts,
      totalViews: ttTotals.totalViews + igTotals.totalViews,
      totalLikes: ttTotals.totalLikes + igTotals.totalLikes,
      totalComments: ttTotals.totalComments + igTotals.totalComments,
      totalShares: ttTotals.totalShares,
      totalSaves: ttTotals.totalSaves,
    };

    await ctx.runMutation(
      internal.app.analyticsV2.updateCampaignCachedTotals,
      { campaignId, rawTotals, firstVideoAt },
    );
  },
});

export const cacheAllCampaignTotals = internalAction({
  args: {},
  handler: async (ctx) => {
    const campaignIds = await ctx.runQuery(
      internal.app.analyticsV2.getAllCampaignIds,
      {},
    );

    for (const campaignId of campaignIds) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.analyticsV2.cacheSingleCampaignTotals,
        { campaignId },
      );
    }

    console.log(
      `[V2 Cache] Scheduled cache refresh for ${campaignIds.length} campaigns`,
    );
  },
});

export const getCampaignListByStatus = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, { status }) => {
    let allCampaigns;
    if (status) {
      allCampaigns = await ctx.db
        .query("campaigns")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    } else {
      allCampaigns = await ctx.db.query("campaigns").collect();
    }

    return allCampaigns.map((campaign) => ({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      artist: campaign.artist,
      song: campaign.song,
      status: campaign.status,
      totals: campaign.cachedTotals ?? {
        posts: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
      },
      firstVideoAt: campaign.cachedFirstVideoAt ?? null,
      cachedAt: campaign.cachedAt ?? null,
      lastUpdatedAt: campaign._creationTime,
    }));
  },
});

// =============================================================================
// PLATFORM POST COUNTS
// =============================================================================

export const getPlatformPostCounts = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const tiktokPosts = await aggregateViews.count(ctx, {
      namespace: campaignId,
      bounds: {},
    });

    const igPosts = await ctx.db
      .query("instagramPostStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    return {
      tiktokPosts,
      instagramPosts: igPosts.length,
    };
  },
});

// =============================================================================
// ONE-TIME UTILITIES
// =============================================================================

// One-time cleanup: delete campaignSnapshots with totalViews=0
/** Backfill bundlePostId on existing tiktokVideoStats that are missing it */
export const backfillBundlePostIds = internalMutation({
  args: {
    items: v.array(v.object({
      tiktokVideoId: v.string(),
      bundlePostId: v.string(),
    })),
  },
  handler: async (ctx, { items }) => {
    let patched = 0;
    for (const { tiktokVideoId, bundlePostId } of items) {
      const existing = await ctx.db
        .query("tiktokVideoStats")
        .withIndex("by_tiktokVideoId", (q) => q.eq("tiktokVideoId", tiktokVideoId))
        .first();
      if (existing && !existing.bundlePostId) {
        await ctx.db.patch(existing._id, { bundlePostId });
        patched++;
      }
    }
    if (patched > 0) {
      console.log(`[V2 Backfill] Patched ${patched}/${items.length} tiktokVideoStats with bundlePostId`);
    }
  },
});

export const deleteEmptySnapshots = internalMutation({
  args: {},
  handler: async (ctx) => {
    const snapshots = await ctx.db.query("campaignSnapshots").collect();
    let deleted = 0;
    for (const s of snapshots) {
      if (s.totalViews === 0) {
        await ctx.db.delete(s._id);
        deleted++;
      }
    }
    console.log(`[V2 Cleanup] Deleted ${deleted}/${snapshots.length} empty campaignSnapshots`);
    return { deleted, total: snapshots.length };
  },
});

/**
 * One-time migration: backfill status/total/published from airtableCampaigns
 * into campaigns table. Run this BEFORE deploying the schema change that
 * removes the airtableCampaigns table.
 */
export const backfillCampaignsFromAirtable = internalMutation({
  args: {},
  handler: async (ctx) => {
    // airtableCampaigns table will be removed after migration — use type assertion
    const airtableRows = await (ctx.db.query as Function)("airtableCampaigns").collect() as Array<{
      campaignId: string;
      campaignName: string;
      artist: string;
      song: string;
      status?: string;
      total: number;
      published: number;
    }>;
    let created = 0;
    let updated = 0;

    for (const row of airtableRows) {
      const existing = await ctx.db
        .query("campaigns")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", row.campaignId))
        .first();

      if (existing) {
        // Merge status/total/published into existing campaigns row
        await ctx.db.patch(existing._id, {
          campaignName: row.campaignName,
          artist: row.artist,
          song: row.song,
          status: row.status,
          total: row.total,
          published: row.published,
        });
        updated++;
      } else {
        // Create new campaigns row with defaults
        await ctx.db.insert("campaigns", {
          campaignId: row.campaignId,
          campaignName: row.campaignName,
          artist: row.artist,
          song: row.song,
          status: row.status,
          total: row.total,
          published: row.published,
          minViewsExcludedStats: {
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalSaves: 0,
          },
          minViewsFilter: 0,
          currencySymbol: "USD",
          manualCpmMultiplier: 1,
          apiCpmMultiplier: 0.5,
          contentSamples: [],
        });
        created++;
      }
    }

    console.log(
      `[Migration] Backfilled campaigns from airtableCampaigns: ${created} created, ${updated} updated (${airtableRows.length} total)`,
    );
    return { created, updated, total: airtableRows.length };
  },
});
