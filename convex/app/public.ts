import { action, internalQuery, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { AnalyticsResponse, VideoMetric, DailyMetric } from "./analytics";

// Type definitions for public report response
interface PublicReportResponse {
  reportName: string;
  reportCreatedAt: number;
  dailyData: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    totalVideos: number;
  };
  avgEngagementRate: string;
  videoMetrics: Array<{
    id: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
    engagementRate: string;
    videoInfo: {
      id: string;
      videoUrl: string;
      videoName: string;
      videoType: string;
      createdAt: number;
      tiktokUrl: string | null;
      campaign: {
        id: string;
        campaignName: string;
      };
    };
  }>;
  campaigns: Array<{
    id: string;
    campaignName: string;
    artistName: string;
    songName: string;
    genre: string;
    campaignCoverImageUrl: string;
  }>;
  hiddenVideoIds: string[];
  lastUpdatedAt?: number;
}

export const getSharedReport = action({
  args: {
    shareId: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args): Promise<PublicReportResponse> => {
    try {
      // Find the report by its public share ID
      const report = await ctx.runQuery(internal.app.public.getReportByShareId, {
        shareId: args.shareId,
      });

      if (!report) {
        console.info(`Access attempt to non-existent shared report: ${args.shareId}`);
        throw new Error("Shared report not found.");
      }

      console.info(`Access to shared report ${report._id} via share ID ${args.shareId}`);

      const campaignIds = report.campaignIds;

      if (campaignIds.length === 0) {
        return {
          reportName: report.name,
          reportCreatedAt: report._creationTime,
          dailyData: [],
          totals: { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: 0 },
          avgEngagementRate: "0.00",
          videoMetrics: [],
          campaigns: [],
          hiddenVideoIds: report.hiddenVideoIds,
        };
      }

      // Get campaign details
      const campaigns = await ctx.runQuery(internal.app.public.getCampaignsByIds, {
        campaignIds: report.campaignIds,
      });

      // Get the report owner's user data
      const reportUser = await ctx.runQuery(internal.app.public.getUserById, {
        userId: report.userId,
      });

      if (!reportUser) {
        throw new Error("Report owner not found.");
      }

      // Use the new analytics function with hidden videos already filtered
      const analyticsData: AnalyticsResponse = await ctx.runAction(internal.app.public.getPublicReportAnalytics, {
        campaignIds: campaignIds,
        days: args.days,
        userId: report.userId,
        hiddenVideoIds: report.hiddenVideoIds,
      });

      // No need to filter here as it's already done server-side
      const filteredVideoMetrics = analyticsData.videoMetrics;

      // Transform filtered video metrics to public format
      const sanitizedVideoMetrics = filteredVideoMetrics.map((metric: VideoMetric) => {
        const campaign = campaigns.find((c) => c._id === metric.campaignId);
        const engagement = metric.metrics.likes + metric.metrics.comments + metric.metrics.shares;
        const engagementRate = metric.metrics.views > 0 
          ? ((engagement / metric.metrics.views) * 100).toFixed(2)
          : "0.00";
        
        return {
          id: metric.videoId,
          views: metric.metrics.views,
          likes: metric.metrics.likes,
          comments: metric.metrics.comments,
          shares: metric.metrics.shares,
          engagement,
          engagementRate,
          videoInfo: {
            id: metric.videoId,
            videoUrl: metric.videoUrl,
            videoName: `Video ${metric.videoId.slice(-6)}`,
            videoType: "video/mp4",
            createdAt: metric.postedAt,
            tiktokUrl: metric.platform === "tiktok" ? metric.videoUrl : null,
            campaign: {
              id: metric.campaignId,
              campaignName: campaign?.campaignName || "Unknown",
            },
          },
        };
      });

      // Calculate average engagement rate
      const avgEngagementRate = analyticsData.metrics.engagementRate > 0
        ? (analyticsData.metrics.engagementRate * 100).toFixed(2)
        : "0.00";

      return {
        reportName: report.name,
        reportCreatedAt: report._creationTime,
        dailyData: analyticsData.dailyMetrics.map((day: DailyMetric) => ({
          date: day.date,
          views: day.views,
          likes: day.likes,
          comments: day.comments,
          shares: day.shares,
        })),
        totals: {
          // These totals already exclude hidden videos (filtered server-side)
          views: analyticsData.metrics.views,
          likes: analyticsData.metrics.likes,
          comments: analyticsData.metrics.comments,
          shares: analyticsData.metrics.shares,
          totalVideos: analyticsData.metrics.posts,
        },
        avgEngagementRate,
        videoMetrics: sanitizedVideoMetrics,
        campaigns: campaigns.map((c: Doc<"campaigns">) => ({
          id: c._id,
          campaignName: c.campaignName,
          artistName: c.artistName,
          songName: c.songName,
          genre: c.genre,
          campaignCoverImageUrl: c.campaignCoverImageUrl || "",
        })),
        hiddenVideoIds: report.hiddenVideoIds,
        lastUpdatedAt: analyticsData.metadata.lastUpdatedAt,
      };
    } catch (error) {
      console.error(`Error accessing shared report:`, error);
      throw new Error("An error occurred while accessing the shared report.");
    }
  },
});

export const getReportByShareId = internalQuery({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    // Find report by publicShareId
    const reports = await ctx.db
      .query("reports")
      .filter((q) => q.eq(q.field("publicShareId"), args.shareId))
      .collect();

    return reports[0] || null;
  },
})

export const getCampaignsByIds = internalQuery({
  args: { campaignIds: v.array(v.id("campaigns")) },
  handler: async (ctx, args): Promise<Doc<"campaigns">[]> => {
    const campaigns = await Promise.all(
      args.campaignIds.map(id => ctx.db.get(id))
    );
    return campaigns.filter((c): c is Doc<"campaigns"> => c !== null);
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db.get(args.userId);
  },
});

export const getPublicReportAnalytics = internalAction({
  args: {
    campaignIds: v.array(v.id("campaigns")),
    days: v.number(),
    userId: v.id("users"),
    hiddenVideoIds: v.optional(v.array(v.union(
      v.id("generatedVideos"),
      v.id("manuallyPostedVideos"),
      v.id("ayrsharePostedVideos"),
      v.id("latePostedVideos")
    ))),
  },
  handler: async (ctx, args): Promise<AnalyticsResponse> => {
    // Use the internal analytics function with hidden videos filtering
    const result = await ctx.runAction(internal.app.analytics.fetchAnalyticsFromConvex, {
      campaignIds: args.campaignIds,
      days: args.days,
      userId: args.userId,
      hiddenVideoIds: args.hiddenVideoIds,
    });

    return result;
  },
})

// Type definition for public comments response
interface PublicCommentsResponse {
  comments: Array<{
    id: string;
    videoId: string;
    campaignId: string;
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

export const getPublicComments = action({
  args: {
    shareId: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PublicCommentsResponse> => {
    try {
      // Find the report by its public share ID
      const report = await ctx.runQuery(internal.app.public.getReportByShareId, {
        shareId: args.shareId,
      });

      if (!report) {
        throw new Error("Shared report not found.");
      }

      const campaignIds = report.campaignIds;

      if (!campaignIds || campaignIds.length === 0) {
        return {
          comments: [],
          metadata: {
            totalComments: 0,
            lastUpdatedAt: Date.now(),
          },
        };
      }

      // Fetch comments from Convex (no auth required for public access)
      const result = await ctx.runQuery(internal.app.public.fetchPublicCommentsFromConvex, {
        campaignIds: campaignIds,
        userId: report.userId,
        limit: args.limit || 100,
        offset: args.offset || 0,
      });

      return result;
    } catch (error) {
      console.error(`Error fetching public comments:`, error);
      throw new Error("An error occurred while fetching comments.");
    }
  },
});

export const fetchPublicCommentsFromConvex = internalQuery({
  args: {
    campaignIds: v.array(v.id("campaigns")),
    userId: v.id("users"),
    limit: v.number(),
    offset: v.number(),
  },
  handler: async (ctx, args): Promise<PublicCommentsResponse> => {
    // Reuse the same logic as the authenticated version
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