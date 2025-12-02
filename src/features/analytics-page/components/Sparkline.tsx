"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { DEFAULT_SPARKLINE_COLOR, SPARKLINE_COLORS } from "../constants/analytics-page.constants";
import type { SparklineProps } from "../types/analytics-page.types";

/**
 * Mini sparkline chart component
 *
 * Displays a small area chart for quick trend visualization.
 * Matches the MetricsChart style from campaign/analytics but minimal.
 */
export function Sparkline({
  data,
  dataKey = "views",
  color,
  height = 40,
  width = "100%",
}: SparklineProps) {
  // Use provided color or get from sparkline colors based on dataKey
  const chartColor = color ?? SPARKLINE_COLORS[dataKey] ?? DEFAULT_SPARKLINE_COLOR;

  // Transform data to simple value array for sparkline
  const chartData = data.map((point) => ({
    value: point[dataKey],
  }));

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-xs"
        style={{ height, width }}
      >
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sparklineGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
            <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={chartColor}
          strokeWidth={1.5}
          fill={`url(#sparklineGradient-${dataKey})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
