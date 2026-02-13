"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { AdjustedTotals, ChartDataPoint } from "../types/analytics-v2.types";
import { formatSnapshotDate } from "../utils/format.utils";

export function useChartDataV2(
  campaignId: string,
  adjustedTotals: AdjustedTotals,
) {
  const snapshots = useQuery(api.app.analyticsV2.getCampaignSnapshots, {
    campaignId,
  });

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      // If no snapshots yet, show just the live point
      return [
        {
          label: "Now",
          views: adjustedTotals.totalViews,
          likes: adjustedTotals.totalLikes,
          comments: adjustedTotals.totalComments,
          shares: adjustedTotals.totalShares,
          isLive: true,
        },
      ];
    }

    const historical: ChartDataPoint[] = snapshots.map((s: { snapshotAt: number; totalViews: number; totalLikes: number; totalComments: number; totalShares: number }) => ({
      label: formatSnapshotDate(s.snapshotAt),
      views: s.totalViews,
      likes: s.totalLikes,
      comments: s.totalComments,
      shares: s.totalShares,
    }));

    // Add live "Now" point with real-time aggregate values
    historical.push({
      label: "Now",
      views: adjustedTotals.totalViews,
      likes: adjustedTotals.totalLikes,
      comments: adjustedTotals.totalComments,
      shares: adjustedTotals.totalShares,
      isLive: true,
    });

    return historical;
  }, [snapshots, adjustedTotals]);

  return { chartData, isLoading: snapshots === undefined };
}
