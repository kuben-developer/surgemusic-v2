import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { action, internalAction, internalMutation, internalQuery } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

// Type definitions for analytics return values
export interface AnalyticsMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posts: number;
  engagementRate: number;
}

export interface DailyMetric {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posts: number;
}

export interface VideoMetric {
  videoId: string;
  campaignId: string;
  campaignName: string;
  platform: "tiktok" | "instagram" | "youtube";
  thumbnailUrl: string;
  videoUrl: string;
  postedAt: number;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

export interface CampaignInfo {
  id: string;
  name: string;
  videoCount: number;
  status: string;
}

export interface AnalyticsResponse {
  metrics: AnalyticsMetrics;
  dailyMetrics: DailyMetric[];
  videoMetrics: VideoMetric[];
  allVideoMetrics?: VideoMetric[]; // All videos including hidden ones (only for reports)
  campaigns: CampaignInfo[];
  metadata: {
    lastUpdatedAt: number;
    dateRange: {
      start: string;
      end: string;
    };
    totalVideos: number;
    reportId?: Id<"reports">;
    hiddenVideoIds?: string[];
  };
}

interface CommentsResponse {
  comments: Array<{
    id: string;
    videoId: Id<"manuallyPostedVideos"> | Id<"ayrsharePostedVideos">;
    campaignId: Id<"campaigns">;
    campaignName: string;
    videoUrl: string;
    thumbnailUrl: string;
    platform: "tiktok" | "instagram" | "youtube";
    comment: {
      commentId: string;
      text: string;
      authorUsername: string;
      authorNickname: string;
      authorProfilePicUrl: string;
      createdAt: number;
    };
  }>;
  metadata: {
    totalComments: number;
    lastUpdatedAt: number;
  };
}

interface AggregationResult {
  date: string;
  campaignsProcessed: number;
  results: Array<{
    campaignId: Id<"campaigns">;
    action: "created" | "updated";
    date: string;
    metrics: {
      posts: number;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    };
  }>;
}

export const storeManuallyPostedVideo = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
    videoId: v.string(),
    postedAt: v.number(),
    videoUrl: v.string(),
    mediaUrl: v.optional(v.string()),
    thumbnailUrl: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    socialPlatform: v.union(v.literal("tiktok"), v.literal("instagram"), v.literal("youtube")),
  },
  handler: async (ctx, args) => {
    // Check if video already exists for this campaign and platform
    const existingVideo = await ctx.db
      .query("manuallyPostedVideos")
      .withIndex("by_videoId_socialPlatform", (q) =>
        q.eq("videoId", args.videoId).eq("socialPlatform", args.socialPlatform)
      )
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .unique();

    if (existingVideo) {
      // Update existing video with latest metrics
      await ctx.db.patch(existingVideo._id, {
        views: args.views,
        likes: args.likes,
        comments: args.comments,
        shares: args.shares,
        saves: args.saves,
        updatedAt: Date.now(),
      });

      return { action: "updated", videoId: existingVideo._id };
    } else {
      // Insert new video
      const videoId = await ctx.db.insert("manuallyPostedVideos", {
        campaignId: args.campaignId,
        userId: args.userId,
        socialPlatform: "tiktok",
        videoId: args.videoId,
        postedAt: args.postedAt,
        videoUrl: args.videoUrl,
        mediaUrl: args.mediaUrl,
        thumbnailUrl: args.thumbnailUrl,
        views: args.views,
        likes: args.likes,
        comments: args.comments,
        shares: args.shares,
        saves: args.saves,
        updatedAt: Date.now(),
      });

      return { action: "created", videoId };
    }
  },
});

export const storeVideoComments = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
    videoId: v.id("manuallyPostedVideos"),
    socialPlatform: v.union(v.literal("tiktok"), v.literal("instagram"), v.literal("youtube")),
    comments: v.array(v.object({
      commentId: v.string(),
      text: v.string(),
      authorUsername: v.string(),
      authorNickname: v.string(),
      authorProfilePicUrl: v.string(),
      createdAt: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    let newCommentsCount = 0;
    let updatedCommentsCount = 0;

    for (const comment of args.comments) {
      // Check if comment already exists
      const existingComment = await ctx.db
        .query("comments")
        .withIndex("by_commentId", (q) => q.eq("commentId", comment.commentId))
        .unique();

      if (!existingComment) {
        // Insert new comment
        await ctx.db.insert("comments", {
          commentId: comment.commentId,
          campaignId: args.campaignId,
          userId: args.userId,
          videoId: args.videoId,
          socialPlatform: args.socialPlatform,
          text: comment.text,
          authorUsername: comment.authorUsername,
          authorNickname: comment.authorNickname,
          authorProfilePicUrl: comment.authorProfilePicUrl,
          createdAt: comment.createdAt,
        });
        newCommentsCount++;
      } else {
        // Comment already exists, could update if needed
        updatedCommentsCount++;
      }
    }

    return {
      newComments: newCommentsCount,
      existingComments: updatedCommentsCount,
      totalComments: args.comments.length
    };
  },
});

export const aggregateCampaignPerformance = internalMutation({
  args: {
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    // Get current date in DD-MM-YYYY format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${day}-${month}-${year}`;

    // Determine which campaigns to aggregate
    let campaignIds: Id<"campaigns">[] = [];

    if (args.campaignId) {
      // Aggregate specific campaign
      campaignIds = [args.campaignId];
    } else {
      // Aggregate all campaigns
      const allCampaigns = await ctx.db
        .query("campaigns")
        .filter((q) => q.neq(q.field("isDeleted"), true))
        .collect();
      campaignIds = allCampaigns.map(c => c._id);
    }

    const results = [];

    for (const campaignId of campaignIds) {
      // Get the campaign to get userId
      const campaign = await ctx.db.get(campaignId);
      if (!campaign) continue;

      // Get all manually posted videos for this campaign
      const manualVideos = await ctx.db
        .query("manuallyPostedVideos")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect();

      // Get all API posted videos for this campaign
      const apiVideos = await ctx.db
        .query("ayrsharePostedVideos")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect();

      // Combine both video sources
      const allVideos = [...manualVideos, ...apiVideos];

      if (allVideos.length === 0) {
        // No videos to aggregate for this campaign
        continue;
      }

      // Aggregate metrics across all videos
      const aggregatedMetrics = allVideos.reduce(
        (acc, video) => ({
          posts: acc.posts + 1,
          views: acc.views + video.views,
          likes: acc.likes + video.likes,
          comments: acc.comments + video.comments,
          shares: acc.shares + video.shares,
          saves: acc.saves + video.saves,
        }),
        {
          posts: 0,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
        }
      );

      // Check if a snapshot already exists for this campaign and date
      const existingSnapshot = await ctx.db
        .query("campaignPerformanceSnapshots")
        .withIndex("by_campaignId_date", (q) =>
          q.eq("campaignId", campaignId).eq("date", dateString)
        )
        .unique();

      if (existingSnapshot) {
        // Update existing snapshot
        await ctx.db.patch(existingSnapshot._id, {
          posts: aggregatedMetrics.posts,
          views: aggregatedMetrics.views,
          likes: aggregatedMetrics.likes,
          comments: aggregatedMetrics.comments,
          shares: aggregatedMetrics.shares,
          saves: aggregatedMetrics.saves,
          updatedAt: Date.now(),
        });

        results.push({
          campaignId,
          action: "updated" as const,
          date: dateString,
          metrics: aggregatedMetrics,
        });
      } else {
        // Create new snapshot
        await ctx.db.insert("campaignPerformanceSnapshots", {
          campaignId,
          userId: campaign.userId,
          date: dateString,
          posts: aggregatedMetrics.posts,
          views: aggregatedMetrics.views,
          likes: aggregatedMetrics.likes,
          comments: aggregatedMetrics.comments,
          shares: aggregatedMetrics.shares,
          saves: aggregatedMetrics.saves,
          updatedAt: Date.now(),
        });

        results.push({
          campaignId,
          action: "created" as const,
          date: dateString,
          metrics: aggregatedMetrics,
        });
      }
    }

    return {
      date: dateString,
      campaignsProcessed: results.length,
      results,
    };
  },
});

export const aggregateAllCampaigns = action({
  args: {},
  handler: async (ctx): Promise<AggregationResult> => {
    // This action can be called by a cron job or manually to aggregate all campaigns
    const result = await ctx.runMutation(internal.app.analytics.aggregateCampaignPerformance, {});
    return result;
  },
});

export const aggregateSingleCampaign = action({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args): Promise<AggregationResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the user owns this campaign
    const campaign = await ctx.runQuery(internal.app.campaigns.getCampaignWithUser, {
      campaignId: args.campaignId,
      clerkId: identity.subject,
    });

    if (!campaign) {
      throw new Error("Campaign not found or access denied");
    }

    // Aggregate the specific campaign
    const result = await ctx.runMutation(internal.app.analytics.aggregateCampaignPerformance, {
      campaignId: args.campaignId,
    });
    
    return result;
  },
});

// ==================== NEW SIMPLIFIED ANALYTICS FUNCTIONS ====================

export const getCampaignAnalytics = action({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    days: v.number(),
    hiddenVideoIds: v.optional(v.array(v.union(
      v.id("generatedVideos"), 
      v.id("manuallyPostedVideos"),
      v.id("ayrsharePostedVideos")
    ))),
  },
  handler: async (ctx, args): Promise<AnalyticsResponse> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.users.getByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get campaign IDs to fetch
    let campaignIds = args.campaignIds;
    if (!campaignIds || campaignIds.length === 0) {
      // Get all campaigns for the user
      const userCampaigns: Doc<"campaigns">[] = await ctx.runQuery(api.app.campaigns.getAll, {});
      campaignIds = userCampaigns.map((c) => c._id);
    }

    if (!campaignIds || campaignIds.length === 0) {
      return {
        metrics: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          posts: 0,
          engagementRate: 0,
        },
        dailyMetrics: [],
        videoMetrics: [],
        campaigns: [],
        metadata: {
          lastUpdatedAt: Date.now(),
          dateRange: {
            start: new Date(Date.now() - args.days * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          totalVideos: 0,
        },
      };
    }

    // Fetch analytics data from Convex tables
    const result = await ctx.runAction(internal.app.analytics.fetchAnalyticsFromConvex, {
      campaignIds,
      days: args.days,
      userId: user._id,
      hiddenVideoIds: args.hiddenVideoIds,
    });

    return result;
  },
});

export const getReportAnalyticsV2 = action({
  args: {
    reportId: v.id("reports"),
    days: v.number(),
  },
  handler: async (ctx, args): Promise<AnalyticsResponse> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the report and verify access
    const report = await ctx.runQuery(internal.app.reports.getReportWithCampaigns, {
      reportId: args.reportId,
      clerkId: identity.subject,
    });

    if (!report) {
      throw new Error("Report not found or access denied");
    }

    if (report.campaignIds.length === 0) {
      return {
        metrics: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          posts: 0,
          engagementRate: 0,
        },
        dailyMetrics: [],
        videoMetrics: [],
        campaigns: [],
        metadata: {
          lastUpdatedAt: Date.now(),
          dateRange: {
            start: new Date(Date.now() - args.days * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          totalVideos: 0,
          reportId: args.reportId,
          hiddenVideoIds: report.hiddenVideoIds || [],
        },
      };
    }

    // Get analytics for the report's campaigns with hidden videos filtered
    const analyticsData = await ctx.runAction(internal.app.analytics.fetchAnalyticsFromConvex, {
      campaignIds: report.campaignIds,
      days: args.days,
      userId: report.userId,
      hiddenVideoIds: report.hiddenVideoIds || [],
    });

    // Add report-specific metadata
    return {
      ...analyticsData,
      metadata: {
        ...analyticsData.metadata,
        reportId: args.reportId,
        hiddenVideoIds: report.hiddenVideoIds || [],
      },
    };
  },
});

export const getComments = action({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<CommentsResponse> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.users.getByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get campaign IDs to fetch comments for
    let campaignIds = args.campaignIds;
    if (!campaignIds || campaignIds.length === 0) {
      // Get all campaigns for the user
      const userCampaigns: Doc<"campaigns">[] = await ctx.runQuery(api.app.campaigns.getAll, {});
      campaignIds = userCampaigns.map((c) => c._id);
    }

    if (!campaignIds || campaignIds.length === 0) {
      return {
        comments: [],
        metadata: {
          totalComments: 0,
          lastUpdatedAt: Date.now(),
        },
      };
    }

    // Fetch comments from Convex
    const result = await ctx.runQuery(internal.app.analytics.fetchCommentsFromConvex, {
      campaignIds: campaignIds as Id<"campaigns">[],
      userId: user._id,
      limit: args.limit || 100,
      offset: args.offset || 0,
    });

    return result;
  },
});

// Internal helper to fetch analytics from Convex tables
export const fetchAnalyticsFromConvex = internalAction({
  args: {
    campaignIds: v.array(v.string()),
    days: v.number(),
    userId: v.id("users"),
    hiddenVideoIds: v.optional(v.array(v.union(
      v.id("generatedVideos"), 
      v.id("manuallyPostedVideos"),
      v.id("ayrsharePostedVideos")
    ))),
  },
  handler: async (ctx, args): Promise<AnalyticsResponse> => {
    const endDate = new Date();
    const startDate = new Date(Date.now() - args.days * 24 * 60 * 60 * 1000);
    const hiddenVideoIds = args.hiddenVideoIds || [];

    // Fetch campaigns using internal query (no auth required)
    const campaigns: Array<{
      id: string;
      name: string;
      videoCount: number;
      status: string;
    }> = [];
    for (const campaignId of args.campaignIds) {
      const campaign = await ctx.runQuery(internal.app.campaigns.getInternal, {
        campaignId: campaignId as Id<"campaigns">,
      });
      if (campaign) {
        campaigns.push({
          id: campaign._id,
          name: campaign.campaignName,
          videoCount: campaign.videoCount,
          status: campaign.status,
        });
      }
    }

    // Fetch performance snapshots for date range
    const snapshots = await ctx.runQuery(internal.app.analytics.getPerformanceSnapshots, {
      campaignIds: args.campaignIds as Id<"campaigns">[],
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    });

    // Fetch manually posted videos
    const manualVideos = await ctx.runQuery(internal.app.analytics.getManuallyPostedVideos, {
      campaignIds: args.campaignIds as Id<"campaigns">[],
    });

    // Fetch API posted videos
    const apiVideos = await ctx.runQuery(internal.app.analytics.getAyrsharePostedVideos, {
      campaignIds: args.campaignIds as Id<"campaigns">[],
    });

    // Normalize postedAt for API videos (convert seconds to milliseconds)
    const normalizedApiVideos = apiVideos.map(video => ({
      ...video,
      postedAt: video.postedAt * 1000 // Convert seconds to milliseconds
    }));

    // Combine both sources
    const allVideos = [...manualVideos, ...normalizedApiVideos];

    // Filter out hidden videos
    const videos = allVideos.filter(video => !hiddenVideoIds.includes(video._id));

    // Calculate the proportion of visible videos for adjusting daily metrics
    const totalVideoMetrics = allVideos.reduce(
      (acc, video) => ({
        views: acc.views + video.views,
        likes: acc.likes + video.likes,
        comments: acc.comments + video.comments,
        shares: acc.shares + video.shares,
        saves: acc.saves + video.saves,
      }),
      { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
    );

    const visibleVideoMetrics = videos.reduce(
      (acc, video) => ({
        views: acc.views + video.views,
        likes: acc.likes + video.likes,
        comments: acc.comments + video.comments,
        shares: acc.shares + video.shares,
        saves: acc.saves + video.saves,
      }),
      { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
    );

    // Calculate adjustment ratios for each metric
    const adjustmentRatios = {
      views: totalVideoMetrics.views > 0 ? visibleVideoMetrics.views / totalVideoMetrics.views : 1,
      likes: totalVideoMetrics.likes > 0 ? visibleVideoMetrics.likes / totalVideoMetrics.likes : 1,
      comments: totalVideoMetrics.comments > 0 ? visibleVideoMetrics.comments / totalVideoMetrics.comments : 1,
      shares: totalVideoMetrics.shares > 0 ? visibleVideoMetrics.shares / totalVideoMetrics.shares : 1,
      saves: totalVideoMetrics.saves > 0 ? visibleVideoMetrics.saves / totalVideoMetrics.saves : 1,
    };

    // Aggregate daily metrics from snapshots
    const dailyMetricsMap = new Map<string, {
      date: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      posts: number;
    }>();
    
    snapshots.forEach((snapshot: Doc<"campaignPerformanceSnapshots">) => {
      // Convert DD-MM-YYYY to YYYY-MM-DD
      const parts = snapshot.date.split('-');
      if (parts.length !== 3) return;
      const day = parts[0]!;
      const month = parts[1]!;
      const year = parts[2]!;
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      const existing = dailyMetricsMap.get(isoDate) || {
        date: isoDate,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        posts: 0,
      };
      
      // Apply adjustment ratios to account for hidden videos
      dailyMetricsMap.set(isoDate, {
        date: isoDate,
        views: existing.views + Math.round(snapshot.views * adjustmentRatios.views),
        likes: existing.likes + Math.round(snapshot.likes * adjustmentRatios.likes),
        comments: existing.comments + Math.round(snapshot.comments * adjustmentRatios.comments),
        shares: existing.shares + Math.round(snapshot.shares * adjustmentRatios.shares),
        saves: existing.saves + Math.round(snapshot.saves * adjustmentRatios.saves),
        posts: existing.posts + snapshot.posts,
      });
    });

    // Sort daily metrics by date
    const dailyMetrics = Array.from(dailyMetricsMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Process video metrics (only visible videos)
    const videoMetrics = videos.map((video: Doc<"manuallyPostedVideos"> | Doc<"ayrsharePostedVideos">) => {
      const campaign = campaigns.find(c => c.id === video.campaignId);
      return {
        videoId: video._id,
        campaignId: video.campaignId,
        campaignName: campaign?.name || '',
        platform: video.socialPlatform,
        thumbnailUrl: video.thumbnailUrl,
        videoUrl: video.videoUrl,
        postedAt: video.postedAt,
        metrics: {
          views: video.views,
          likes: video.likes,
          comments: video.comments,
          shares: video.shares,
          saves: video.saves,
        },
      };
    });

    // Process ALL video metrics (including hidden) if we're filtering (for report manage videos modal)
    const allVideoMetrics = args.hiddenVideoIds !== undefined ? allVideos.map((video: Doc<"manuallyPostedVideos"> | Doc<"ayrsharePostedVideos">) => {
      const campaign = campaigns.find(c => c.id === video.campaignId);
      return {
        videoId: video._id,
        campaignId: video.campaignId,
        campaignName: campaign?.name || '',
        platform: video.socialPlatform,
        thumbnailUrl: video.thumbnailUrl,
        videoUrl: video.videoUrl,
        postedAt: video.postedAt,
        metrics: {
          views: video.views,
          likes: video.likes,
          comments: video.comments,
          shares: video.shares,
          saves: video.saves,
        },
      };
    }) : undefined;

    // Calculate total metrics
    const totalMetrics = videoMetrics.reduce(
      (acc: { views: number; likes: number; comments: number; shares: number; saves: number; posts: number }, video: VideoMetric) => ({
        views: acc.views + video.metrics.views,
        likes: acc.likes + video.metrics.likes,
        comments: acc.comments + video.metrics.comments,
        shares: acc.shares + video.metrics.shares,
        saves: acc.saves + video.metrics.saves,
        posts: acc.posts + 1,
      }),
      { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, posts: 0 }
    );

    // Calculate engagement rate as decimal
    const engagementRate = totalMetrics.views > 0
      ? (totalMetrics.likes + totalMetrics.comments + totalMetrics.shares) / totalMetrics.views
      : 0;

    return {
      metrics: {
        ...totalMetrics,
        engagementRate,
      },
      dailyMetrics,
      videoMetrics,
      allVideoMetrics, // Include all videos when filtering is active
      campaigns,
      metadata: {
        lastUpdatedAt: Date.now(),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        totalVideos: videoMetrics.length,
      },
    };
  },
});

// Internal queries for fetching data
export const getPerformanceSnapshots = internalQuery({
  args: {
    campaignIds: v.array(v.id("campaigns")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const snapshots = [];
    
    for (const campaignId of args.campaignIds) {
      const campaignSnapshots = await ctx.db
        .query("campaignPerformanceSnapshots")
        .withIndex("by_campaignId", q => q.eq("campaignId", campaignId))
        .collect();
      
      // Filter by date range
      const filtered = campaignSnapshots.filter(snapshot => {
        // Convert DD-MM-YYYY to timestamp for comparison
        const parts = snapshot.date.split('-');
        if (parts.length !== 3) return false;
        const [day, month, year] = parts;
        const snapshotDate = new Date(`${year}-${month}-${day}`).getTime();
        return snapshotDate >= args.startDate && snapshotDate <= args.endDate;
      });
      
      snapshots.push(...filtered);
    }
    
    return snapshots;
  },
});

export const getManuallyPostedVideos = internalQuery({
  args: {
    campaignIds: v.array(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const videos = [];
    
    for (const campaignId of args.campaignIds) {
      const campaignVideos = await ctx.db
        .query("manuallyPostedVideos")
        .withIndex("by_campaignId", q => q.eq("campaignId", campaignId))
        .collect();
      videos.push(...campaignVideos);
    }
    
    return videos;
  },
});

export const getAyrsharePostedVideos = internalQuery({
  args: {
    campaignIds: v.array(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const videos = [];
    
    for (const campaignId of args.campaignIds) {
      const campaignVideos = await ctx.db
        .query("ayrsharePostedVideos")
        .withIndex("by_campaignId", q => q.eq("campaignId", campaignId))
        .collect();
      videos.push(...campaignVideos);
    }
    
    return videos;
  },
});

export const fetchCommentsFromConvex = internalQuery({
  args: {
    campaignIds: v.array(v.id("campaigns")),
    userId: v.id("users"),
    limit: v.number(),
    offset: v.number(),
  },
  handler: async (ctx, args) => {
    const allComments = [];
    
    for (const campaignId of args.campaignIds) {
      // Get comments for this campaign
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_campaignId", q => q.eq("campaignId", campaignId))
        .collect();
      
      // Get video information for each comment
      for (const comment of comments) {
        const video = await ctx.db.get(comment.videoId);
        if (video) {
          const campaign = await ctx.db.get(campaignId);
          allComments.push({
            id: comment._id,
            videoId: comment.videoId,
            campaignId: comment.campaignId,
            campaignName: campaign?.campaignName || '',
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            platform: comment.socialPlatform,
            comment: {
              commentId: comment.commentId,
              text: comment.text,
              authorUsername: comment.authorUsername,
              authorNickname: comment.authorNickname,
              authorProfilePicUrl: comment.authorProfilePicUrl,
              createdAt: comment.createdAt,
            },
          });
        }
      }
    }
    
    // Sort by createdAt descending
    allComments.sort((a, b) => b.comment.createdAt - a.comment.createdAt);
    
    // Apply pagination
    const paginatedComments = allComments.slice(args.offset, args.offset + args.limit);
    
    return {
      comments: paginatedComments,
      metadata: {
        totalComments: allComments.length,
        lastUpdatedAt: Date.now(),
      },
    };
  },
});