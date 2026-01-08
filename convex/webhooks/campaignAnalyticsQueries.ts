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
 * Internal query to fetch campaign analytics data
 * Respects minViewsFilter setting to filter out posts with fewer views
 */
export const getCampaignAnalyticsInternal = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const analytics = await ctx.db
      .query("campaignAnalytics")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    if (!analytics) {
      return null;
    }

    // Get minViewsFilter setting
    const minViewsFilter = analytics.minViewsFilter ?? 0;

    // If no minViewsFilter, return pre-calculated totals
    if (minViewsFilter === 0) {
      return {
        campaignId: analytics.campaignId,
        campaignName: analytics.campaignName,
        artist: analytics.artist,
        song: analytics.song,
        totalPosts: analytics.totalPosts,
        totalViews: analytics.totalViews,
        totalLikes: analytics.totalLikes,
        totalComments: analytics.totalComments,
        totalShares: analytics.totalShares,
        totalSaves: analytics.totalSaves,
        contentSamples: analytics.contentSamples ?? [],
      };
    }

    // minViewsFilter is set - recalculate totals from filtered posts
    const bundlePosts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Get valid postIds from airtableContents
    const airtablePosts = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const airtablePostIds = new Set(airtablePosts.map((item) => item.postId));

    // Filter posts: must exist in airtable AND meet minViews threshold
    const filteredPosts = bundlePosts.filter((post) =>
      airtablePostIds.has(post.postId) && post.views >= minViewsFilter
    );

    // Calculate totals from filtered posts
    const totalPosts = filteredPosts.length;
    const totalViews = filteredPosts.reduce((acc, post) => acc + post.views, 0);
    const totalLikes = filteredPosts.reduce((acc, post) => acc + post.likes, 0);
    const totalComments = filteredPosts.reduce((acc, post) => acc + post.comments, 0);
    const totalShares = filteredPosts.reduce((acc, post) => acc + post.shares, 0);
    const totalSaves = filteredPosts.reduce((acc, post) => acc + post.saves, 0);

    return {
      campaignId: analytics.campaignId,
      campaignName: analytics.campaignName,
      artist: analytics.artist,
      song: analytics.song,
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      contentSamples: analytics.contentSamples ?? [],
    };
  },
});

/**
 * Internal query to fetch top performing videos for a campaign
 * Respects minViewsFilter setting to filter out posts with fewer views
 */
export const getTopVideosInternal = internalQuery({
  args: {
    campaignId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, { campaignId, limit }) => {
    // Get minViewsFilter setting from campaign analytics
    const analytics = await ctx.db
      .query("campaignAnalytics")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    const minViewsFilter = analytics?.minViewsFilter ?? 0;

    // Get all posts for this campaign
    const bundlePosts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Get valid postIds from airtableContents
    const airtablePosts = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter to only include posts that exist in airtableContents AND meet minViews threshold
    const airtablePostIds = new Set(airtablePosts.map((item) => item.postId));
    const filteredPosts = bundlePosts.filter((post) =>
      airtablePostIds.has(post.postId) && post.views >= minViewsFilter
    );

    // Sort by views descending and take top N
    const topVideos = filteredPosts
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map((post) => ({
        videoId: post.videoId,
        postId: post.postId,
        views: post.views,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        saves: post.saves,
        videoUrl: post.videoUrl,
        mediaUrl: post.mediaUrl,
      }));

    return topVideos;
  },
});
