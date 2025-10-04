"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTabs } from "./ChartTabs";
import type { AdvancedVideoMetric, ChartType } from "../types/advanced-analytics.types";
import { countriesCodeName } from "../../../../../public/countries";

interface VideoMetricsChartProps {
  video: AdvancedVideoMetric;
}

const chartVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function VideoMetricsChart({ video }: VideoMetricsChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>("retention");

  // Prepare data for retention chart (sort by second and multiply percentage by 100)
  const retentionData = video.videoViewRetention
    ?.map((item) => ({
      second: parseFloat(item.second),
      name: `${item.second}s`,
      value: item.percentage * 100, // Convert from 0.1 to 10%
    }))
    .sort((a, b) => a.second - b.second) || [];

  // Prepare data for engagement likes chart (sort by second and multiply percentage by 100)
  const engagementData = video.engagementLikes
    ?.map((item) => ({
      second: parseFloat(item.second),
      name: `${item.second}s`,
      value: item.percentage * 100, // Convert from 0.1 to 10%
    }))
    .sort((a, b) => a.second - b.second) || [];

  // Prepare data for countries chart (sort by percentage, put "Others" last)
  const countriesData = (() => {
    if (!video.audienceCountries) return [];

    const mapped = video.audienceCountries.map((item) => ({
      name: item.country, // 2-letter code for x-axis
      fullName: countriesCodeName[item.country as keyof typeof countriesCodeName] || item.country, // Full name for tooltip
      value: item.percentage * 100, // Convert from 0.1 to 10%
    }));

    // Separate "Others" from the rest
    const others = mapped.filter((item) => item.name === "Others" || item.fullName === "Others");
    const nonOthers = mapped.filter((item) => item.name !== "Others" && item.fullName !== "Others");

    // Sort non-Others by percentage descending, then append Others
    return [...nonOthers.sort((a, b) => b.value - a.value), ...others];
  })();

  // Map gender values to user-friendly labels
  const mapGenderLabel = (gender: string): string => {
    const mapping: Record<string, string> = {
      'female_vv': 'Female',
      'male_vv': 'Male',
      'other_vv': 'Others',
    };
    return mapping[gender] || gender;
  };

  // Prepare data for genders chart (multiply percentage by 100)
  const gendersData = video.audienceGenders?.map((item) => ({
    name: mapGenderLabel(item.gender),
    value: item.percentage * 100, // Convert from 0.1 to 10%
  })) || [];

  // Get chart config based on active chart
  const getChartConfig = () => {
    switch (activeChart) {
      case "retention":
        return {
          data: retentionData,
          type: "line" as const,
          color: "#3B82F6",
          label: "Retention %",
        };
      case "engagement":
        return {
          data: engagementData,
          type: "line" as const,
          color: "#EF4444",
          label: "Engagement %",
        };
      case "countries":
        return {
          data: countriesData.slice(0, 10), // Top 10 countries
          type: "bar" as const,
          color: "#10B981",
          label: "Audience %",
        };
      case "genders":
        return {
          data: gendersData,
          type: "bar" as const,
          color: "#F59E0B",
          label: "Audience %",
        };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden sticky top-4 p-3">
      {/* Compact Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative h-10 w-8 rounded overflow-hidden bg-muted/50 flex-shrink-0">
            <video
              src={video.videoUrl}
              className="h-full w-full object-cover"
              poster={video.thumbnailUrl}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold truncate">{video.campaignName}</h4>
            <p className="text-[10px] text-muted-foreground">
              {video.views.toLocaleString()}
            </p>
          </div>
        </div>

        <ChartTabs activeChart={activeChart} onChartChange={setActiveChart} />
      </div>

      {/* Compact Chart */}
      <motion.div
        className="h-72 bg-card/50 rounded-lg p-2 border border-border/20"
        key={activeChart}
        variants={chartVariants}
        initial="hidden"
        animate="visible"
      >
        {chartConfig.data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartConfig.type === "line" ? (
              <LineChart data={chartConfig.data}>
                <defs>
                  <linearGradient id={`gradient-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="dark:stroke-gray-700 stroke-gray-200"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  className="dark:fill-gray-400 fill-gray-500"
                  tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 11 }}
                  axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
                  tickLine={false}
                  tickFormatter={(value) => `${value.replace("s", "")}`}
                />
                <YAxis
                  className="dark:fill-gray-400 fill-gray-500"
                  tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 9 }}
                  axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
                  tickLine={false}
                  width={25}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.375rem",
                    padding: "4px 8px",
                    color: "var(--foreground)",
                  }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 600, fontSize: 12 }}
                  itemStyle={{ color: "var(--foreground)", fontSize: 12 }}
                  formatter={(value: number) => [`${Math.round(value)}%`, chartConfig.label.replace(" %", "")]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartConfig.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${activeChart})`}
                  dot={false}
                  activeDot={{
                    r: 3,
                    stroke: chartConfig.color,
                    strokeWidth: 1.5,
                    fill: "var(--background)",
                  }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartConfig.data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="dark:stroke-gray-700 stroke-gray-200"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  className="dark:fill-gray-400 fill-gray-500"
                  tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 11 }}
                  axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
                  tickLine={false}
                  
                />
                <YAxis
                  className="dark:fill-gray-400 fill-gray-500"
                  tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 9 }}
                  axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
                  tickLine={false}
                  width={25}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.375rem",
                    padding: "4px 8px",
                    color: "var(--foreground)",
                  }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 600, fontSize: 12 }}
                  itemStyle={{ color: "var(--foreground)", fontSize: 12 }}
                  labelFormatter={(label, payload) => {
                    if (activeChart === "countries" && payload?.[0]?.payload?.fullName) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                  formatter={(value: number) => [`${Math.round(value)}%`, chartConfig.label.replace(" %", "")]}
                />
                <Bar dataKey="value" fill={chartConfig.color} radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] text-muted-foreground">No data</p>
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-muted/30 p-2">
          <div className="text-[10px] text-muted-foreground mb-1">Avg Watch Time</div>
          <div className="text-sm font-semibold tabular-nums">
            {video.averageTimeWatched ? `${Math.round(video.averageTimeWatched)}s` : "—"}
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 p-2">
          <div className="text-[10px] text-muted-foreground mb-1">Hook Score</div>
          <div className="text-sm font-semibold tabular-nums">
            {video.hookScore !== null ? `${Math.round(video.hookScore * 100)}%` : "—"}
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 p-2">
          <div className="text-[10px] text-muted-foreground mb-1">Engagement Rate</div>
          <div className="text-sm font-semibold tabular-nums">
            {video.engagementRate.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 p-2">
          <div className="text-[10px] text-muted-foreground mb-1">Full Video Rate</div>
          <div className="text-sm font-semibold tabular-nums">
            {video.fullVideoWatchedRate ? `${Math.round(video.fullVideoWatchedRate * 100)}%` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
