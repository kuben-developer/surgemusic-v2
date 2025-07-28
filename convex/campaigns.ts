import { createClient } from '@clickhouse/client';
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalAction, internalQuery, mutation, query } from "./_generated/server";

// Initialize ClickHouse client
const getClickHouseClient = () => {
  if (!process.env.CLICKHOUSE_HOST || !process.env.CLICKHOUSE_DATABASE) {
    throw new Error('ClickHouse configuration is missing');
  }

  return createClient({
    host: process.env.CLICKHOUSE_HOST,
    database: process.env.CLICKHOUSE_DATABASE,
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
  });
};

function numericUuid() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return timestamp + random;
}

export const create = mutation({
  args: {
    campaignName: v.string(),
    songName: v.string(),
    artistName: v.string(),
    campaignCoverImageUrl: v.optional(v.string()),
    videoCount: v.number(),
    genre: v.string(),
    themes: v.array(v.string()),
    songAudioUrl: v.optional(v.string()),
    musicVideoUrl: v.optional(v.string()),
    lyricVideoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const totalCredits = user.credits.videoGeneration + user.credits.videoGenerationAdditional;
    if (totalCredits < args.videoCount) {
      throw new Error("Insufficient video generation credits");
    }

    const referenceId = numericUuid();

    const campaignId = await ctx.db.insert("campaigns", {
      referenceId,
      userId: user._id,
      campaignName: args.campaignName,
      songName: args.songName,
      artistName: args.artistName,
      campaignCoverImageUrl: args.campaignCoverImageUrl,
      videoCount: args.videoCount,
      genre: args.genre,
      themes: args.themes,
      status: "pending",
    });

    await ctx.scheduler.runAfter(0, internal.campaigns.sendWebhook, {
      campaignId,
      referenceId,
      ...args,
    });

    return referenceId;
  },
});

export const get = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id) {
      return null;
    }

    return campaign;
  },
});

export const getGeneratedVideos = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id || campaign.status !== "completed") {
      return [];
    }

    const videos = await ctx.db
      .query("generatedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // TODO: Add logic to check and update video URLs from Ayrshare
    // This requires complex platform-specific logic that needs adaptation

    return videos;
  },
});

export const getPostedVideos = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id || campaign.status !== "completed") {
      return [];
    }

    const videos = await ctx.db
      .query("generatedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Filter videos that have been posted to at least one platform
    return videos.filter(video =>
      (video.tiktokUpload?.post?.url) ||
      (video.instagramUpload?.post?.url) ||
      (video.youtubeUpload?.post?.url)
    );
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return campaigns.sort((a, b) => b._creationTime - a._creationTime);
  },
});

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
    const { videos, analytics } = await ctx.runAction(internal.campaigns.fetchCampaignAnalytics, {
      campaignId: args.campaignId,
      days: args.days,
    });

    return analytics;
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
    return await ctx.runAction(internal.campaigns.fetchCombinedAnalytics, {
      campaignIds: args.campaignIds,
      days,
      clerkId: identity.subject,
    });
  },
});

export const getAllWithFolders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get all folders with their campaigns
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const foldersWithCampaigns = await Promise.all(
      folders.map(async (folder) => {
        const campaigns = await Promise.all(
          folder.campaignIds.map(id => ctx.db.get(id))
        );
        return {
          id: folder._id,
          name: folder.name,
          createdAt: folder._creationTime,
          updatedAt: folder._creationTime,
          campaigns: campaigns.filter(c => c !== null),
          campaignCount: campaigns.filter(c => c !== null).length,
        };
      })
    );

    // Get all campaigns not in any folder
    const allCampaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const campaignIdsInFolders = new Set(
      folders.flatMap(f => f.campaignIds)
    );

    const unorganizedCampaigns = allCampaigns
      .filter(c => !campaignIdsInFolders.has(c._id))
      .map(c => ({
        ...c,
        id: c._id,
        createdAt: c._creationTime,
        updatedAt: c._creationTime,
      }));

    return {
      folders: foldersWithCampaigns.sort((a, b) => b.createdAt - a.createdAt),
      unorganizedCampaigns: unorganizedCampaigns.sort((a, b) => b.createdAt - a.createdAt),
    };
  },
});

export const getScheduledVideos = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id) {
      return [];
    }

    const videos = await ctx.db
      .query("generatedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Filter and transform scheduled videos
    const scheduledVideos = videos
      .filter(video => {
        // Check if video is scheduled but not posted for any platform
        const tiktokScheduled = video.tiktokUpload?.scheduledAt && !video.tiktokUpload?.status?.isPosted;
        const instagramScheduled = video.instagramUpload?.scheduledAt && !video.instagramUpload?.status?.isPosted;
        const youtubeScheduled = video.youtubeUpload?.scheduledAt && !video.youtubeUpload?.status?.isPosted;

        return tiktokScheduled || instagramScheduled || youtubeScheduled;
      })
      .map(video => {
        // Get the earliest scheduled time and post info
        let earliestSchedule = null;
        let postInfo = null;
        let platforms = [];

        if (video.tiktokUpload?.scheduledAt && !video.tiktokUpload?.status?.isPosted) {
          earliestSchedule = video.tiktokUpload.scheduledAt;
          postInfo = video.tiktokUpload.post;
          platforms.push({ platform: "tiktok", username: "TikTok Account" });
        }

        if (video.instagramUpload?.scheduledAt && !video.instagramUpload?.status?.isPosted) {
          if (!earliestSchedule || video.instagramUpload.scheduledAt < earliestSchedule) {
            earliestSchedule = video.instagramUpload.scheduledAt;
            postInfo = video.instagramUpload.post;
          }
          platforms.push({ platform: "instagram", username: "Instagram Account" });
        }

        if (video.youtubeUpload?.scheduledAt && !video.youtubeUpload?.status?.isPosted) {
          if (!earliestSchedule || video.youtubeUpload.scheduledAt < earliestSchedule) {
            earliestSchedule = video.youtubeUpload.scheduledAt;
            postInfo = video.youtubeUpload.post;
          }
          platforms.push({ platform: "youtube", username: "YouTube Account" });
        }

        return {
          id: video._id,
          videoName: video.video.name,
          videoUrl: video.video.url,
          postId: postInfo?.id || "",
          scheduledAt: new Date(earliestSchedule!),
          postCaption: postInfo?.caption || "",
          scheduledSocialAccounts: platforms,
        };
      })
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

    return scheduledVideos;
  },
});

export const sendWebhook = internalAction({
  args: {
    campaignId: v.any(),
    referenceId: v.string(),
    campaignName: v.string(),
    songName: v.string(),
    artistName: v.string(),
    campaignCoverImageUrl: v.optional(v.string()),
    videoCount: v.number(),
    genre: v.string(),
    themes: v.array(v.string()),
    songAudioUrl: v.optional(v.string()),
    musicVideoUrl: v.optional(v.string()),
    lyricVideoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    try {
      const isCustomCampaign = args.themes.length > 0;
      let payload;

      if (isCustomCampaign) {
        payload = [{
          "Album Art": args.campaignCoverImageUrl || "",
          "Artist Name": args.artistName,
          "Credits": args.videoCount.toString(),
          "Genre": args.genre,
          "Girls content": args.themes.includes("girls") ? "Yes" : "No",
          "luxuryLifestyle": args.themes.includes("luxury_lifestyle") ? "Yes" : "No",
          "natureLifestyle": args.themes.includes("nature_lifestyle") ? "Yes" : "No",
          "customEnterpriseContent": args.themes.includes("enterprise") ? "Yes" : "No",
          "Music": args.songAudioUrl || "",
          "Music Content": args.themes.includes("recommendation") ? "Yes" : "No",
          "Performance Video": args.musicVideoUrl || "",
          "Reaction Content": args.themes.includes("reactions") ? "Yes" : "No",
          "Song Name": args.songName,
          "Campaign ID": args.referenceId,
          "Campaign Setup": "custom",
          "lyricVideo": args.lyricVideoUrl || "",
        }];
      } else {
        payload = [{
          "Credits": args.videoCount.toString(),
          "Music": args.songAudioUrl || "",
          "Campaign ID": args.referenceId,
          "Song Name": args.songName,
          "Artist Name": args.artistName,
          "Genre": args.genre,
          "Campaign Setup": "express",
          "lyricVideo": args.lyricVideoUrl || "",
        }];
      }

      console.log("Sending webhook payload:", payload);

      const webhookResponse = await fetch("https://hkdk.events/gbzu8j6tggs0nr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!webhookResponse.ok) {
        console.error("Failed to send campaign data to webhook:", await webhookResponse.text());
      } else {
        console.log("Campaign data sent to webhook successfully", await webhookResponse.text());
      }
    } catch (error) {
      console.error("Error sending campaign data to webhook:", error);
    }
  },
})

export const getCampaignWithUser = internalQuery({
  args: {
    campaignId: v.id("campaigns"),
    clerkId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id) return null;

    return campaign;
  },
})

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
})

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
})