"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { AdjustedTotals, ChartDataPoint } from "../types/analytics-v2.types";
import { formatSnapshotDate, formatSnapshotLabel } from "../utils/format.utils";

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

  // Area chart: campaign growth over time
  const growthChartData: ChartDataPoint[] = useMemo(() => {
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

    // Determine if we should show hourly or daily data
    // snapshotAt is YYYYMMDDHH — parse first and last to check span
    const firstAt = snapshots[0]!.snapshotAt;
    const lastAt = snapshots[snapshots.length - 1]!.snapshotAt;
    const parseSnapshotToMs = (at: number) => {
      const str = at.toString().padStart(10, "0");
      return Date.UTC(
        parseInt(str.slice(0, 4), 10),
        parseInt(str.slice(4, 6), 10) - 1,
        parseInt(str.slice(6, 8), 10),
        parseInt(str.slice(8, 10), 10),
      );
    };
    const spanMs = parseSnapshotToMs(lastAt) - parseSnapshotToMs(firstAt);
    const isHourly = spanMs <= 24 * 60 * 60 * 1000;

    let pointsToPlot: Array<{ snapshotAt: number; totalViews: number; totalLikes: number; totalComments: number; totalShares: number }>;

    if (isHourly) {
      // Show all hourly snapshots
      pointsToPlot = snapshots;
    } else {
      // Group by day, keep the last snapshot per day
      const byDate = new Map<string, typeof snapshots[number]>();
      for (const s of snapshots) {
        const str = s.snapshotAt.toString().padStart(10, "0");
        const key = `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
        const existing = byDate.get(key);
        if (!existing || s.snapshotAt > existing.snapshotAt) {
          byDate.set(key, s);
        }
      }
      pointsToPlot = [...byDate.values()].sort((a, b) => a.snapshotAt - b.snapshotAt);
    }

    const historical: ChartDataPoint[] = pointsToPlot.map((s) => ({
      label: isHourly ? formatSnapshotLabel(s.snapshotAt) : formatSnapshotDate(s.snapshotAt),
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

  // Bar chart: stats breakdown by posting date
  const barChartData: ChartDataPoint[] = useMemo(() => {
    if (!dailyStatsByDate || dailyStatsByDate.length === 0) {
      return [];
    }

    let filtered = dailyStatsByDate;

    // If date filter is active, narrow to selected range
    if (dateFilter) {
      const fromDate = new Date(dateFilter.from * 1000);
      const toDate = new Date(dateFilter.to * 1000);
      const fromKey = `${fromDate.getUTCFullYear()}-${String(fromDate.getUTCMonth() + 1).padStart(2, "0")}-${String(fromDate.getUTCDate()).padStart(2, "0")}`;
      const toKey = `${toDate.getUTCFullYear()}-${String(toDate.getUTCMonth() + 1).padStart(2, "0")}-${String(toDate.getUTCDate()).padStart(2, "0")}`;
      filtered = dailyStatsByDate.filter(
        (d) => d.postDate >= fromKey && d.postDate <= toKey,
      );
    }

    return filtered.map((d) => {
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
  }, [dailyStatsByDate, dateFilter]);

  // Daily gain chart: delta between consecutive days from campaign snapshots
  // Note: excluded stats cancel out in the delta (same amount subtracted from both days)
  const dailyGainChartData: ChartDataPoint[] = useMemo(() => {
    if (!snapshots || snapshots.length < 2) return [];

    // Group snapshots by UTC date, keeping the last snapshot of each day
    // snapshotAt is YYYYMMDDHH format (e.g. 2025021412 = Feb 14, 2025 12:00)
    const byDate = new Map<string, { snapshotAt: number; totalViews: number; totalLikes: number; totalComments: number; totalShares: number }>();
    for (const s of snapshots) {
      const str = s.snapshotAt.toString().padStart(10, "0");
      const key = `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
      const existing = byDate.get(key);
      if (!existing || s.snapshotAt > existing.snapshotAt) {
        byDate.set(key, s);
      }
    }

    const sortedDays = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    // Compute deltas between consecutive days
    const result: ChartDataPoint[] = [];
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = sortedDays[i - 1][1];
      const curr = sortedDays[i][1];
      const [y, m, day] = sortedDays[i][0].split("-");
      const date = new Date(Number(y), Number(m) - 1, Number(day));
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      result.push({
        label,
        views: Math.max(0, curr.totalViews - prev.totalViews),
        likes: Math.max(0, curr.totalLikes - prev.totalLikes),
        comments: Math.max(0, curr.totalComments - prev.totalComments),
        shares: Math.max(0, curr.totalShares - prev.totalShares),
      });
    }

    // Add today's partial gain (live aggregate vs last snapshot)
    if (sortedDays.length > 0) {
      const lastSnapshot = sortedDays[sortedDays.length - 1][1];
      const exViews = excludedStats?.totalViews ?? 0;
      const exLikes = excludedStats?.totalLikes ?? 0;
      const exComments = excludedStats?.totalComments ?? 0;
      const exShares = excludedStats?.totalShares ?? 0;

      // adjustedTotals already has excluded subtracted, so add it back for comparison
      const liveViews = adjustedTotals.totalViews + exViews;
      const liveLikes = adjustedTotals.totalLikes + exLikes;
      const liveComments = adjustedTotals.totalComments + exComments;
      const liveShares = adjustedTotals.totalShares + exShares;

      const todayViews = liveViews - lastSnapshot.totalViews;
      const todayLikes = liveLikes - lastSnapshot.totalLikes;
      const todayComments = liveComments - lastSnapshot.totalComments;
      const todayShares = liveShares - lastSnapshot.totalShares;

      if (todayViews > 0 || todayLikes > 0 || todayComments > 0 || todayShares > 0) {
        result.push({
          label: "Today",
          views: Math.max(0, todayViews),
          likes: Math.max(0, todayLikes),
          comments: Math.max(0, todayComments),
          shares: Math.max(0, todayShares),
          isLive: true,
        });
      }
    }

    return result;
  }, [snapshots, adjustedTotals, excludedStats]);

  return { growthChartData, barChartData, dailyGainChartData, isLoading: snapshots === undefined };
}
