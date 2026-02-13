"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { AdjustedTotals, ChartDataPoint } from "../types/analytics-v2.types";
import { formatSnapshotDate } from "../utils/format.utils";

interface ExcludedStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

export function useChartDataV2(
  campaignId: string,
  adjustedTotals: AdjustedTotals,
  excludedStats?: ExcludedStats,
) {
  const snapshots = useQuery(api.app.analyticsV2.getCampaignSnapshots, {
    campaignId,
  });

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
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

    const exViews = excludedStats?.totalViews ?? 0;
    const exLikes = excludedStats?.totalLikes ?? 0;
    const exComments = excludedStats?.totalComments ?? 0;
    const exShares = excludedStats?.totalShares ?? 0;

    const historical: ChartDataPoint[] = snapshots.map((s: { snapshotAt: number; totalViews: number; totalLikes: number; totalComments: number; totalShares: number }) => ({
      label: formatSnapshotDate(s.snapshotAt),
      views: Math.max(0, s.totalViews - exViews),
      likes: Math.max(0, s.totalLikes - exLikes),
      comments: Math.max(0, s.totalComments - exComments),
      shares: Math.max(0, s.totalShares - exShares),
    }));

    historical.push({
      label: "Now",
      views: adjustedTotals.totalViews,
      likes: adjustedTotals.totalLikes,
      comments: adjustedTotals.totalComments,
      shares: adjustedTotals.totalShares,
      isLive: true,
    });

    return historical;
  }, [snapshots, adjustedTotals, excludedStats]);

  return { chartData, isLoading: snapshots === undefined };
}
