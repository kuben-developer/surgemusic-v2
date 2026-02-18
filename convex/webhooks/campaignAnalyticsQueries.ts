import { v } from "convex/values";
import { internalAction, internalQuery } from "../_generated/server";
import { api } from "../_generated/api";

interface CampaignOutput {
  id: string;
  campaign_id: string;
  artist: string;
  song: string;
  status: string;
}

interface CampaignPublicOutput {
  id: string;
  name: string;
  artistName: string;
  songName: string;
  status: string;
}

/**
 * Internal action to fetch all campaigns from Airtable
 * Uses the getCampaigns action to fetch directly from Airtable API
 */
export const getAllCampaignsInternal = internalAction({
  args: {},
  handler: async (ctx): Promise<CampaignPublicOutput[]> => {
    // Fetch campaigns directly from Airtable
    const campaigns: CampaignOutput[] = await ctx.runAction(api.app.airtable.getCampaigns, {});

    // Map to the expected output format
    // Campaigns are returned in order from Airtable (typically most recent first)
    return campaigns.map((campaign: CampaignOutput) => ({
      id: campaign.id,
      name: campaign.campaign_id,
      artistName: campaign.artist,
      songName: campaign.song,
      status: campaign.status,
    }));
  },
});

/**
 * Internal query to fetch campaign analytics data from V2 tables
 * Respects minViewsFilter setting to filter out posts with fewer views
 */
export const getCampaignAnalyticsInternal = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!campaign) {
      return null;
    }

    // Get minViewsFilter setting
    const minViewsFilter = campaign.minViewsFilter ?? 0;

    // If no minViewsFilter, return pre-calculated totals from minViewsExcludedStats
    if (minViewsFilter === 0) {
      const stats = campaign.minViewsExcludedStats;
      return {
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        artist: campaign.artist,
        song: campaign.song,
        totalPosts: stats.totalPosts,
        totalViews: stats.totalViews,
        totalLikes: stats.totalLikes,
        totalComments: stats.totalComments,
        totalShares: stats.totalShares,
        totalSaves: stats.totalSaves,
        contentSamples: campaign.contentSamples ?? [],
      };
    }

    // minViewsFilter is set - recalculate totals from filtered posts
    const videoStats = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Get valid postIds from airtableContents
    const airtablePosts = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Build set of valid tiktokVideoIds from airtable (using tiktokId or bundlePostId mapping)
    const airtablePostIds = new Set(airtablePosts.map((item) => item.postId));

    // Filter: meet minViews threshold and have a matching airtable record
    const filteredStats = videoStats.filter((stat) => {
      const matchesAirtable = airtablePostIds.has(stat.bundlePostId ?? "") ||
        airtablePostIds.has(stat.tiktokVideoId);
      return matchesAirtable && stat.views >= minViewsFilter;
    });

    // Calculate totals from filtered posts
    const totalPosts = filteredStats.length;
    const totalViews = filteredStats.reduce((acc, s) => acc + s.views, 0);
    const totalLikes = filteredStats.reduce((acc, s) => acc + s.likes, 0);
    const totalComments = filteredStats.reduce((acc, s) => acc + s.comments, 0);
    const totalShares = filteredStats.reduce((acc, s) => acc + s.shares, 0);
    const totalSaves = filteredStats.reduce((acc, s) => acc + s.saves, 0);

    return {
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      artist: campaign.artist,
      song: campaign.song,
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      contentSamples: campaign.contentSamples ?? [],
    };
  },
});

/**
 * Internal query to fetch all videos for a campaign with their stats from V2
 * Respects minViewsFilter setting to filter out posts with fewer views
 */
export const getAllVideosInternal = internalQuery({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, { campaignId }) => {
    // Get minViewsFilter setting from V2 campaigns table
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const minViewsFilter = campaign?.minViewsFilter ?? 0;

    // Get all video stats for this campaign from V2
    const videoStats = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Get valid postIds from airtableContents
    const airtablePosts = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter to only include posts that exist in airtableContents AND meet minViews threshold
    const airtablePostIds = new Set(airtablePosts.map((item) => item.postId));
    const filteredStats = videoStats.filter((stat) => {
      const matchesAirtable = airtablePostIds.has(stat.bundlePostId ?? "") ||
        airtablePostIds.has(stat.tiktokVideoId);
      return matchesAirtable && stat.views >= minViewsFilter;
    });

    // Sort by views descending and return all posts
    return filteredStats
      .sort((a, b) => b.views - a.views)
      .map((stat) => ({
        videoId: stat.tiktokVideoId,
        postId: stat.bundlePostId ?? stat.tiktokVideoId,
        views: stat.views,
        likes: stat.likes,
        comments: stat.comments,
        shares: stat.shares,
        saves: stat.saves,
        videoUrl: undefined as string | undefined,
        mediaUrl: stat.mediaUrl,
        postedAt: stat.postedAt,
        updatedAt: stat._creationTime,
        isManual: stat.isManual,
      }));
  },
});

/**
 * Internal query to fetch top performing videos for a campaign from V2
 * Respects minViewsFilter setting to filter out posts with fewer views
 */
export const getTopVideosInternal = internalQuery({
  args: {
    campaignId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, { campaignId, limit }) => {
    // Get minViewsFilter setting from V2 campaigns table
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const minViewsFilter = campaign?.minViewsFilter ?? 0;

    // Get all video stats for this campaign from V2
    const videoStats = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Get valid postIds from airtableContents
    const airtablePosts = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter to only include posts that exist in airtableContents AND meet minViews threshold
    const airtablePostIds = new Set(airtablePosts.map((item) => item.postId));
    const filteredStats = videoStats.filter((stat) => {
      const matchesAirtable = airtablePostIds.has(stat.bundlePostId ?? "") ||
        airtablePostIds.has(stat.tiktokVideoId);
      return matchesAirtable && stat.views >= minViewsFilter;
    });

    // Sort by views descending and take top N
    const topVideos = filteredStats
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map((stat) => ({
        videoId: stat.tiktokVideoId,
        postId: stat.bundlePostId ?? stat.tiktokVideoId,
        views: stat.views,
        likes: stat.likes,
        comments: stat.comments,
        shares: stat.shares,
        saves: stat.saves,
        videoUrl: undefined as string | undefined,
        mediaUrl: stat.mediaUrl,
      }));

    return topVideos;
  },
});
