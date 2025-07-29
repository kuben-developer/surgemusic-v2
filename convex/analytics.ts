// import { createClient } from '@clickhouse/client';
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

// Initialize ClickHouse client
const getClickHouseClient = () => {
  if (!process.env.CLICKHOUSE_HOST || !process.env.CLICKHOUSE_DATABASE) {
    throw new Error('ClickHouse configuration is missing');
  }

  return 1 as any
};

export const getAnalytics = action({
  args: {
    campaignId: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get campaign from database to validate ownership
    const campaign = await ctx.runQuery(internal.campaigns.getCampaignWithUser, {
      campaignId: args.campaignId as any,
      clerkId: identity.subject,
    });

    if (!campaign) {
      throw new Error("Campaign not found or access denied");
    }

    // Get videos and analytics data
    const { analytics } = await ctx.runAction(internal.analytics.fetchCampaignAnalytics, {
      campaignId: args.campaignId,
      days: args.days,
    });

    return analytics;
  },
});

export const getReportAnalytics = action({
  args: {
    id: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // If days=30, try to fetch from blob storage first
    if (args.days === 30) {
      try {
        const blobUrl = `https://zessa1ux5tl2b8nb.public.blob.vercel-storage.com/report-analytics/${args.id}.json`;
        const response = await fetch(blobUrl);

        if (response.ok) {
          const blobData = await response.json();
          console.log(`Analytics fetched from blob for report ${args.id}`);

          const { reportId, processedAt, ...analyticsData } = blobData;
          return analyticsData;
        }
      } catch (error) {
        console.log(`Failed to fetch from blob for report ${args.id}, falling back to real-time calculation`);
      }
    }

    // Fall back to real-time calculation
    const report = await ctx.runQuery(internal.reports.getReportWithCampaigns, {
      reportId: args.id as any,
      clerkId: identity.subject,
    });

    if (!report) {
      throw new Error("Report not found or access denied");
    }

    const campaignIds = report.campaignIds;
    if (campaignIds.length === 0) {
      return {
        dailyData: [],
        totals: { views: 0, likes: 0, comments: 0, shares: 0 },
        avgEngagementRate: "0.00",
        videoMetrics: [],
        campaigns: [],
        hiddenVideoIds: report.hiddenVideoIds,
        lastUpdatedAt: null
      };
    }

    // Use the fetchCombinedAnalytics action
    const analyticsData = await ctx.runAction(internal.analytics.fetchCombinedAnalytics, {
      campaignIds: campaignIds as any,
      days: args.days,
      clerkId: identity.subject,
    });

    return {
      ...analyticsData,
      hiddenVideoIds: report.hiddenVideoIds,
    };
  },
});

export const getCombinedAnalytics = action({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    days: v.number(),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const days = args.days || 30;

    // Check if we should use cached data
    if (!args.campaignIds?.length && days === 30) {
      try {
        const response = await fetch('https://zessa1ux5tl2b8nb.public.blob.vercel-storage.com/getCombinedAnalytics.json');
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error("Failed to fetch cached analytics:", error);
      }
    }

    // Fetch real-time analytics
    return await ctx.runAction(internal.analytics.fetchCombinedAnalytics, {
      campaignIds: args.campaignIds,
      days,
      clerkId: identity.subject,
    });
  },
});

export const fetchCampaignAnalytics = internalAction({
  args: {
    campaignId: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args): Promise<{
    videos: any[];
    analytics: {
      dailyData: any[];
      totals: { views: number; likes: number; comments: number; shares: number };
      avgEngagementRate: string;
      videoMetrics: any[];
      lastUpdatedAt: number | null;
    };
  }> => {
    try {
      // 1. Fetch campaign and videos from Convex
      const campaign = await ctx.runQuery(api.campaigns.get, {
        campaignId: args.campaignId as any,
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const videos: any[] = await ctx.runQuery(api.campaigns.getGeneratedVideos, {
        campaignId: args.campaignId as any,
      });

      if (videos.length === 0) {
        return {
          videos: [],
          analytics: {
            dailyData: [],
            totals: { views: 0, likes: 0, comments: 0, shares: 0 },
            avgEngagementRate: "0.00",
            videoMetrics: [],
            lastUpdatedAt: null,
          },
        };
      }

      // 2. Query ClickHouse for analytics data
      const client = getClickHouseClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - args.days);

      // Get video URLs for the query
      const videoUrls = videos
        .map((v: any) => [
          v.tiktokUpload?.post?.url,
          v.instagramUpload?.post?.url,
          v.youtubeUpload?.post?.url
        ])
        .flat()
        .filter((url: any) => url);

      if (videoUrls.length === 0) {
        return {
          videos,
          analytics: {
            dailyData: [],
            totals: { views: 0, likes: 0, comments: 0, shares: 0 },
            avgEngagementRate: "0.00",
            videoMetrics: [],
            lastUpdatedAt: null,
          },
        };
      }

      // Query for daily aggregated data
      const dailyQuery = `
        SELECT 
          toDate(created_at) as date,
          sum(view_count) as views,
          sum(like_count) as likes,
          sum(comment_count) as comments,
          sum(share_count) as shares
        FROM video_analytics
        WHERE 
          video_url IN {videoUrls:Array(String)}
          AND created_at >= {startDate:DateTime}
          AND created_at <= {endDate:DateTime}
        GROUP BY date
        ORDER BY date ASC
      `;

      const dailyResult = await client.query({
        query: dailyQuery,
        query_params: {
          videoUrls,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        format: 'JSONEachRow',
      });

      const dailyData = await dailyResult.json();

      // Query for video-level metrics
      const videoMetricsQuery = `
        SELECT 
          video_url,
          sum(view_count) as views,
          sum(like_count) as likes,
          sum(comment_count) as comments,
          sum(share_count) as shares,
          max(created_at) as last_updated
        FROM video_analytics
        WHERE 
          video_url IN {videoUrls:Array(String)}
          AND created_at >= {startDate:DateTime}
          AND created_at <= {endDate:DateTime}
        GROUP BY video_url
      `;

      const videoMetricsResult = await client.query({
        query: videoMetricsQuery,
        query_params: {
          videoUrls,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        format: 'JSONEachRow',
      });

      const videoMetricsData = await videoMetricsResult.json();

      // 3. Process and aggregate the data
      const totals = (dailyData as any[]).reduce(
        (acc: any, day: any) => ({
          views: acc.views + (day.views || 0),
          likes: acc.likes + (day.likes || 0),
          comments: acc.comments + (day.comments || 0),
          shares: acc.shares + (day.shares || 0),
        }),
        { views: 0, likes: 0, comments: 0, shares: 0 }
      );

      // Calculate engagement rate
      const avgEngagementRate = totals.views > 0
        ? (((totals.likes + totals.comments + totals.shares) / totals.views) * 100).toFixed(2)
        : "0.00";

      // Map video metrics to include video info
      const videoMetrics = (videoMetricsData as any[]).map((metric: any) => {
        const video = videos.find((v: any) =>
          v.tiktokUpload?.post?.url === metric.video_url ||
          v.instagramUpload?.post?.url === metric.video_url ||
          v.youtubeUpload?.post?.url === metric.video_url
        );

        return {
          videoInfo: video || { id: 'unknown', videoUrl: metric.video_url },
          views: metric.views || 0,
          likes: metric.likes || 0,
          comments: metric.comments || 0,
          shares: metric.shares || 0,
          engagementRate: metric.views > 0
            ? (((metric.likes + metric.comments + metric.shares) / metric.views) * 100).toFixed(2)
            : "0.00",
        };
      });

      await client.close();

      return {
        videos,
        analytics: {
          dailyData,
          totals,
          avgEngagementRate,
          videoMetrics,
          lastUpdatedAt: Date.now(),
        },
      };
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      // Return empty analytics on error
      return {
        videos: [],
        analytics: {
          dailyData: [],
          totals: { views: 0, likes: 0, comments: 0, shares: 0 },
          avgEngagementRate: "0.00",
          videoMetrics: [],
          lastUpdatedAt: null,
        },
      };
    }
  },
});

export const fetchCombinedAnalytics = internalAction({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    days: v.number(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get user to verify access
      const user = await ctx.runQuery(internal.users.getByClerkId, {
        clerkId: args.clerkId,
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get all user campaigns if no specific ones requested
      let campaignIds = args.campaignIds;
      if (!campaignIds || campaignIds.length === 0) {
        const allCampaigns = await ctx.runQuery(api.campaigns.getAll, {});
        campaignIds = allCampaigns.map((c: any) => c._id);
      }

      if (!campaignIds || campaignIds.length === 0) {
        return {
          dailyData: [],
          totals: { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: 0 },
          avgEngagementRate: "0.00",
          videoMetrics: [],
          campaigns: [],
          lastUpdatedAt: null,
        };
      }

      // Fetch all videos for these campaigns
      const allVideos: any[] = [];
      const campaigns: any[] = [];

      for (const campaignId of campaignIds) {
        const campaign = await ctx.runQuery(api.campaigns.get, {
          campaignId: campaignId as any,
        });

        if (campaign) {
          campaigns.push(campaign);
          const videos = await ctx.runQuery(api.campaigns.getGeneratedVideos, {
            campaignId: campaignId as any,
          });
          allVideos.push(...videos);
        }
      }

      if (allVideos.length === 0) {
        return {
          dailyData: [],
          totals: { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: 0 },
          avgEngagementRate: "0.00",
          videoMetrics: [],
          campaigns,
          lastUpdatedAt: null,
        };
      }

      // Query ClickHouse for combined analytics
      const client = getClickHouseClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - args.days);

      // Get all video URLs
      const videoUrls = allVideos
        .map(v => [
          v.tiktokUpload?.post?.url,
          v.instagramUpload?.post?.url,
          v.youtubeUpload?.post?.url
        ])
        .flat()
        .filter((url: any) => url);

      if (videoUrls.length === 0) {
        return {
          dailyData: [],
          totals: { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: allVideos.length },
          avgEngagementRate: "0.00",
          videoMetrics: [],
          campaigns,
          lastUpdatedAt: null,
        };
      }

      // Query for daily aggregated data
      const dailyQuery = `
        SELECT 
          toDate(created_at) as date,
          sum(view_count) as views,
          sum(like_count) as likes,
          sum(comment_count) as comments,
          sum(share_count) as shares
        FROM video_analytics
        WHERE 
          video_url IN {videoUrls:Array(String)}
          AND created_at >= {startDate:DateTime}
          AND created_at <= {endDate:DateTime}
        GROUP BY date
        ORDER BY date ASC
      `;

      const dailyResult = await client.query({
        query: dailyQuery,
        query_params: {
          videoUrls,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        format: 'JSONEachRow',
      });

      const dailyData = await dailyResult.json();

      // Query for video-level metrics
      const videoMetricsQuery = `
        SELECT 
          video_url,
          sum(view_count) as views,
          sum(like_count) as likes,
          sum(comment_count) as comments,
          sum(share_count) as shares,
          max(created_at) as last_updated
        FROM video_analytics
        WHERE 
          video_url IN {videoUrls:Array(String)}
          AND created_at >= {startDate:DateTime}
          AND created_at <= {endDate:DateTime}
        GROUP BY video_url
      `;

      const videoMetricsResult = await client.query({
        query: videoMetricsQuery,
        query_params: {
          videoUrls,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        format: 'JSONEachRow',
      });

      const videoMetricsData = await videoMetricsResult.json();

      // Process and aggregate the data
      const totals: any = (dailyData as any[]).reduce(
        (acc: any, day: any) => ({
          views: acc.views + (day.views || 0),
          likes: acc.likes + (day.likes || 0),
          comments: acc.comments + (day.comments || 0),
          shares: acc.shares + (day.shares || 0),
        }),
        { views: 0, likes: 0, comments: 0, shares: 0 }
      );

      // Add total videos count
      totals.totalVideos = allVideos.length;

      // Calculate engagement rate
      const avgEngagementRate = totals.views > 0
        ? (((totals.likes + totals.comments + totals.shares) / totals.views) * 100).toFixed(2)
        : "0.00";

      // Map video metrics to include video and campaign info
      const videoMetrics = (videoMetricsData as any[]).map((metric: any) => {
        const video = allVideos.find((v: any) =>
          v.tiktokUpload?.post?.url === metric.video_url ||
          v.instagramUpload?.post?.url === metric.video_url ||
          v.youtubeUpload?.post?.url === metric.video_url
        );

        const campaign = video
          ? campaigns.find((c: any) => c._id === video.campaignId)
          : null;

        return {
          videoInfo: {
            ...video,
            campaign: campaign ? {
              id: campaign._id,
              campaignName: campaign.campaignName,
            } : undefined,
          },
          views: metric.views || 0,
          likes: metric.likes || 0,
          comments: metric.comments || 0,
          shares: metric.shares || 0,
          engagementRate: metric.views > 0
            ? (((metric.likes + metric.comments + metric.shares) / metric.views) * 100).toFixed(2)
            : "0.00",
        };
      });

      await client.close();

      return {
        dailyData,
        totals,
        avgEngagementRate,
        videoMetrics,
        campaigns,
        lastUpdatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching combined analytics:', error);
      // Return empty analytics on error
      return {
        dailyData: [],
        totals: { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: 0 },
        avgEngagementRate: "0.00",
        videoMetrics: [],
        campaigns: [],
        lastUpdatedAt: null,
      };
    }
  },
});