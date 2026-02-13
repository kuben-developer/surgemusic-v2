"use client";

import React, { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface VideoSparkChartProps {
  tiktokVideoId: string;
}

function VideoSparkChartInner({ tiktokVideoId }: VideoSparkChartProps) {
  const snapshots = useQuery(api.app.analyticsV2.getVideoSnapshots, {
    tiktokVideoId,
  });

  const { data, color } = useMemo(() => {
    if (!snapshots || snapshots.length < 2) {
      return { data: [], color: "#9CA3AF" }; // gray
    }

    const chartData = snapshots.map((s: { views: number }) => ({ v: s.views }));

    // Determine trend color
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    if (!first || !last) return { data: chartData, color: "#9CA3AF" };

    const diff = last.views - first.views;
    const trendColor =
      diff > 0 ? "#22C55E" : diff < 0 ? "#EF4444" : "#9CA3AF";

    return { data: chartData, color: trendColor };
  }, [snapshots]);

  if (data.length < 2) {
    return (
      <div className="w-16 h-8 flex items-center justify-center">
        <div className="w-8 h-px bg-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${tiktokVideoId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${tiktokVideoId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Memoize with custom comparator: only re-render if tiktokVideoId changes
export const VideoSparkChart = React.memo(
  VideoSparkChartInner,
  (prev, next) => prev.tiktokVideoId === next.tiktokVideoId,
);
