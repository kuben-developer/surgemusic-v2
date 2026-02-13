"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { AdjustedTotals, CampaignSettings } from "../types/analytics-v2.types";

export function useCampaignAnalyticsV2(campaignId: string) {
  const data = useQuery(api.app.analyticsV2.getCampaignAnalyticsV2, {
    campaignId,
  });

  const dailySnapshots = useQuery(
    api.app.analyticsV2.getDailySnapshotsByDate,
    { campaignId },
  );

  const adjustedTotals: AdjustedTotals = useMemo(() => {
    if (!data) {
      return {
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
      };
    }
    return data.adjustedTotals;
  }, [data]);

  const settings: CampaignSettings = useMemo(() => {
    if (!data) {
      return {
        minViewsFilter: 0,
        currencySymbol: "USD" as const,
        manualCpmMultiplier: 1,
        apiCpmMultiplier: 0.5,
      };
    }
    return data.settings;
  }, [data]);

  // Post counts by date for calendar (YYYY-MM-DD -> count)
  const postCountsByDate: Record<string, number> = useMemo(() => {
    if (!dailySnapshots) return {};
    const result: Record<string, number> = {};
    for (const snapshot of dailySnapshots) {
      result[snapshot.postDate] = snapshot.totalPosts;
    }
    return result;
  }, [dailySnapshots]);

  return {
    isLoading: data === undefined,
    campaignName: data?.campaignName ?? "",
    artist: data?.artist ?? "",
    song: data?.song ?? "",
    adjustedTotals,
    aggregateTotals: data?.aggregateTotals,
    settings,
    contentSamples: data?.contentSamples ?? [],
    postCountsByDate,
  };
}
