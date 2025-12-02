"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import type { AggregateTotals, CampaignWithAnalytics } from "../types/analytics-page.types";

/**
 * Hook for fetching all campaigns with their analytics data
 *
 * Returns:
 * - campaigns: Array of campaigns with analytics
 * - aggregateTotals: Summed totals across all campaigns
 * - isLoading: Whether data is still loading
 */
export function useAllCampaignsAnalytics() {
  // Fetch all campaigns with analytics from Convex
  const campaignsData = useQuery(api.app.analytics.getAllCampaignsWithAnalytics);

  // Transform and type the data
  const campaigns: CampaignWithAnalytics[] = useMemo(() => {
    if (!campaignsData) return [];

    return campaignsData.map((campaign) => ({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      artist: campaign.artist,
      song: campaign.song,
      totals: {
        posts: campaign.totals.posts,
        views: campaign.totals.views,
        likes: campaign.totals.likes,
        comments: campaign.totals.comments,
        shares: campaign.totals.shares,
        saves: campaign.totals.saves,
      },
      sparklineData: campaign.sparklineData.map((point) => ({
        date: point.date,
        views: point.views,
        likes: point.likes,
        comments: point.comments,
        shares: point.shares,
      })),
      lastUpdatedAt: campaign.lastUpdatedAt,
    }));
  }, [campaignsData]);

  // Calculate aggregate totals across all campaigns
  const aggregateTotals: AggregateTotals = useMemo(() => {
    if (campaigns.length === 0) {
      return {
        campaigns: 0,
        posts: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };
    }

    return campaigns.reduce(
      (acc, campaign) => ({
        campaigns: acc.campaigns + 1,
        posts: acc.posts + campaign.totals.posts,
        views: acc.views + campaign.totals.views,
        likes: acc.likes + campaign.totals.likes,
        comments: acc.comments + campaign.totals.comments,
        shares: acc.shares + campaign.totals.shares,
      }),
      {
        campaigns: 0,
        posts: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      }
    );
  }, [campaigns]);

  // Loading state: query returns undefined while loading
  const isLoading = campaignsData === undefined;

  return {
    campaigns,
    aggregateTotals,
    isLoading,
  };
}
