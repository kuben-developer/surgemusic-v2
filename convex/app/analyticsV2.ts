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

// =============================================================================
// CONSTANTS
// =============================================================================

const TOKAPI_KEY = "808a45b29cf9422798bcc4560909b4c2";
const BUNDLE_SOCIAL_API_KEY = process.env.BUNDLE_SOCIAL_API_KEY!;
const CHUNK_SIZE = 200; // Airtable contents per action invocation
const CONCURRENCY = 20; // Parallel HTTP requests within a chunk
const POPULATE_STAGGER_MS = 5 * 60 * 1000; // 5 minutes between campaigns

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

interface TokapiVideoDetails {
  authorUid: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  createTime: number;
}

async function fetchTokapiVideoDetails(
  videoId: string,
): Promise<TokapiVideoDetails | null> {
  try {
    const response = await fetch(
      `http://api.tokapi.online/v1/post/${videoId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-project-name": "tokapi",
          "x-api-key": TOKAPI_KEY,
        },
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!response.ok) {
      console.error(
        `Tokapi: Failed to fetch video ${videoId}: HTTP ${response.status}`,
      );
      return null;
    }

    const data = await response.json();

    if (data.status_code !== 0 || !data.aweme_detail) {
      return null;
    }

    const aweme = data.aweme_detail;
    const stats = aweme.statistics;
    const author = aweme.author;

    if (!stats || !author) {
      return null;
    }

    return {
      authorUid: String(author.uid || author.id || ""),
      views: stats.play_count || 0,
      likes: stats.digg_count || 0,
      comments: stats.comment_count || 0,
      shares: stats.share_count || 0,
      saves: stats.collect_count || 0,
      createTime: aweme.create_time || 0,
    };
  } catch (error) {
    console.error(`Tokapi: Error fetching video ${videoId}:`, error);
    return null;
  }
}

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
    return videos.map((v) => v.tiktokVideoId);
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
    const campaigns = await ctx.db.query("airtableCampaigns").collect();
    return [...new Set(campaigns.map((c) => c.campaignId))];
  },
});

export const getActiveCampaigns = internalQuery({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db
      .query("airtableCampaigns")
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
    totalPosts: v.number(),
    totalViews: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalShares: v.number(),
    totalSaves: v.number(),
  },
  handler: async (ctx, args) => {
    const intervalId = getHourlyIntervalId(args.campaignId);
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

export const migrateSingleCampaign = internalMutation({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // Check if already migrated
    const existing = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (existing) return;

    // Get campaign info from airtableCampaigns
    const airtableCampaign = await ctx.db
      .query("airtableCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!airtableCampaign) return;

    // Get settings from campaignAnalytics (V1)
    const v1Analytics = await ctx.db
      .query("campaignAnalytics")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    await ctx.db.insert("campaigns", {
      campaignId,
      campaignName: airtableCampaign.campaignName,
      artist: airtableCampaign.artist,
      song: airtableCampaign.song,
      minViewsExcludedStats: {
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
      },
      minViewsFilter: v1Analytics?.minViewsFilter ?? 0,
      currencySymbol: v1Analytics?.currencySymbol ?? "USD",
      manualCpmMultiplier: v1Analytics?.manualCpmMultiplier ?? 1,
      apiCpmMultiplier: v1Analytics?.apiCpmMultiplier ?? 0.5,
      contentSamples: v1Analytics?.contentSamples ?? [],
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
// USER-FACING QUERIES
// =============================================================================

export const getCampaignAnalyticsV2 = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // Read aggregates (real-time)
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

    // Read campaign record for settings and excluded stats
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const excluded = campaign?.minViewsExcludedStats ?? {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalSaves: 0,
    };

    return {
      campaignId,
      campaignName: campaign?.campaignName ?? "",
      artist: campaign?.artist ?? "",
      song: campaign?.song ?? "",
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
    },
  ) => {
    // Get settings-level minViewsFilter
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const settingsMinViewsFilter = campaign?.minViewsFilter ?? 0;

    let videos = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Apply settings-level filter
    if (settingsMinViewsFilter > 0) {
      videos = videos.filter((v) => v.views >= settingsMinViewsFilter);
    }

    // Apply user filters
    if (minViews !== undefined) {
      videos = videos.filter((v) => v.views >= minViews);
    }
    if (maxViews !== undefined) {
      videos = videos.filter((v) => v.views <= maxViews);
    }
    if (isManualOnly) {
      videos = videos.filter((v) => v.isManual === true);
    }

    const totalCount = videos.length;

    // Sort and paginate
    const sorted = videos.sort((a, b) =>
      sortOrder === "desc" ? b.views - a.views : a.views - b.views,
    );

    const paginated = sorted.slice(offset, offset + limit).map((v) => ({
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
    }));

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

export const getCampaignSnapshots = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const snapshots = await ctx.db
      .query("campaignSnapshots")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    return snapshots
      .sort((a, b) => a.snapshotAt - b.snapshotAt)
      .slice(-336) // Last 14 days * 24 hours
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
  },
});

export const getDailySnapshotsByDate = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // Compute daily stats in real-time from tiktokVideoStats
    const videos = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const byDate: Record<string, {
      totalPosts: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      totalSaves: number;
    }> = {};

    for (const video of videos) {
      const date = new Date(video.postedAt * 1000);
      const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

      if (!byDate[dateKey]) {
        byDate[dateKey] = {
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalSaves: 0,
        };
      }

      const entry = byDate[dateKey]!;
      entry.totalPosts++;
      entry.totalViews += video.views;
      entry.totalLikes += video.likes;
      entry.totalComments += video.comments;
      entry.totalShares += video.shares;
      entry.totalSaves += video.saves;
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
      internal.app.analytics.getAirtablePostsByCampaign,
      { campaignId },
    );

    if (offset >= airtableContents.length) return;

    const existingVideoIds = await ctx.runQuery(
      internal.app.analyticsV2.getExistingVideoIds,
      { campaignId },
    );
    const existingSet = new Set(existingVideoIds);

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
        pending.push({ postId: content.postId, isManual });
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
    };

    async function processItem(item: PendingItem): Promise<VideoResult | null> {
      let tiktokVideoId: string | null = item.tiktokId ?? null;
      let mediaUrl = "";
      let postedAt = 0;

      // Resolve tiktokVideoId via Bundle Social if needed
      if (!tiktokVideoId && item.postId) {
        const bundleResult = await fetchBundleSocialPost(item.postId);
        if (!bundleResult) return null;
        tiktokVideoId = bundleResult.tiktokVideoId;
        mediaUrl = bundleResult.mediaUrl;
        postedAt = bundleResult.postedAt;
      }

      if (!tiktokVideoId || existingSet.has(tiktokVideoId)) return null;

      // Fetch stats from Tokapi
      const details = await fetchTokapiVideoDetails(tiktokVideoId);
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
      };
    }

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

    console.log(
      `[V2 Populate] Campaign ${campaignId} [${offset}..${offset + chunk.length - 1}/${airtableContents.length}]: ${videos.length} new, ${errors} errors (${pending.length} pending, ${CONCURRENCY} concurrency)`,
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
    // Read aggregate totals
    const totals = await ctx.runQuery(
      internal.app.analyticsV2.getAggregateTotals,
      { campaignId },
    );

    // Write campaign snapshot
    await ctx.runMutation(internal.app.analyticsV2.writeCampaignSnapshot, {
      campaignId,
      ...totals,
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

export const migrateCampaignData = internalAction({
  args: { campaignId: v.optional(v.string()) },
  handler: async (ctx, { campaignId }) => {
    if (campaignId) {
      // Migrate a single campaign
      await ctx.runMutation(internal.app.analyticsV2.migrateSingleCampaign, {
        campaignId,
      });
      console.log(`[V2 Migrate] Migrated campaign ${campaignId}`);
      return;
    }

    // Migrate all campaigns
    const campaignIds = await ctx.runQuery(
      internal.app.analyticsV2.getAllCampaignIds,
      {},
    );

    for (const id of campaignIds) {
      await ctx.runMutation(internal.app.analyticsV2.migrateSingleCampaign, {
        campaignId: id,
      });
    }

    console.log(`[V2 Migrate] Migrated ${campaignIds.length} campaigns`);
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
