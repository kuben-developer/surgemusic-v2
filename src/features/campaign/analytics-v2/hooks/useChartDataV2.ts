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

interface DailyStats {
  postDate: string;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}

interface DateFilter {
  from: number;
  to: number;
}

export function useChartDataV2(
  campaignId: string,
  adjustedTotals: AdjustedTotals,
  excludedStats?: ExcludedStats,
  dateFilter?: DateFilter,
  dailyStatsByDate?: DailyStats[],
) {
  const snapshots = useQuery(api.app.analyticsV2.getCampaignSnapshots, {
    campaignId,
  });

  const chartData: ChartDataPoint[] = useMemo(() => {
    // When date filter is active, show per-day breakdown from daily stats
    if (dateFilter && dailyStatsByDate) {
      const fromDate = new Date(dateFilter.from * 1000);
      const toDate = new Date(dateFilter.to * 1000);
      const fromKey = `${fromDate.getUTCFullYear()}-${String(fromDate.getUTCMonth() + 1).padStart(2, "0")}-${String(fromDate.getUTCDate()).padStart(2, "0")}`;
      const toKey = `${toDate.getUTCFullYear()}-${String(toDate.getUTCMonth() + 1).padStart(2, "0")}-${String(toDate.getUTCDate()).padStart(2, "0")}`;

      const filtered = dailyStatsByDate.filter(
        (d) => d.postDate >= fromKey && d.postDate <= toKey,
      );

      if (filtered.length === 0) {
        return [
          {
            label: "No data",
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
          },
        ];
      }

      return filtered.map((d) => {
        // Format "2025-02-14" → "Feb 14"
        const [y, m, day] = d.postDate.split("-");
        const date = new Date(Number(y), Number(m) - 1, Number(day));
        const label = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return {
          label,
          views: d.totalViews,
          likes: d.totalLikes,
          comments: d.totalComments,
          shares: d.totalShares,
        };
      });
    }

    // No date filter: show campaign growth over time from snapshots
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
  }, [snapshots, adjustedTotals, excludedStats, dateFilter, dailyStatsByDate]);

  return { chartData, isLoading: snapshots === undefined };
}
