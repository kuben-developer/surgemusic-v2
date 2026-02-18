"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../../convex/_generated/api";
import type { CampaignWithAnalytics } from "@/features/analytics-page/types/analytics-page.types";

export function useCampaignList(status: string, skip = false) {
  const campaignsData = useQuery(
    api.app.analyticsV2.getAllCampaignsWithAnalyticsV2,
    skip ? "skip" : { status },
  );

  const campaigns: CampaignWithAnalytics[] = useMemo(() => {
    if (!campaignsData) return [];

    return campaignsData.map((campaign) => ({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      artist: campaign.artist,
      song: campaign.song,
      status: campaign.status,
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
      firstVideoAt: campaign.firstVideoAt,
      lastUpdatedAt: campaign.lastUpdatedAt,
    }));
  }, [campaignsData]);

  const isLoading = !skip && campaignsData === undefined;

  return {
    campaigns,
    isLoading,
  };
}
