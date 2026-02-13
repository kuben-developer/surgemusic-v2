"use client";

import React, { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { SnapshotPoint } from "../hooks/useVideoPerformanceV2";

interface VideoSparkChartProps {
  tiktokVideoId: string;
  snapshots?: SnapshotPoint[];
}

function VideoSparkChartInner({ snapshots }: VideoSparkChartProps) {
  const { data, color } = useMemo(() => {
    if (!snapshots || snapshots.length < 2) {
      return { data: [], color: "#9CA3AF" }; // gray
    }

    const chartData = snapshots.map((s) => ({ v: s.views }));

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
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Memoize: only re-render if snapshots reference changes
export const VideoSparkChart = React.memo(
  VideoSparkChartInner,
  (prev, next) =>
    prev.tiktokVideoId === next.tiktokVideoId &&
    prev.snapshots === next.snapshots,
);
