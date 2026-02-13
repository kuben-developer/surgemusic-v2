"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts";
import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { chartVariants } from "../constants/metrics-v2";
import { formatCompactNumber } from "../utils/format.utils";
import type { MetricType, ChartDataPoint } from "../types/analytics-v2.types";

interface MetricsChartV2Props {
  chartData: ChartDataPoint[];
  activeMetric: MetricType;
  onActiveMetricChange: (metric: MetricType) => void;
}

const METRIC_CONFIG = {
  views: { label: "Views", icon: Eye, color: "#3B82F6" },
  likes: { label: "Likes", icon: Heart, color: "#EF4444" },
  comments: { label: "Comments", icon: MessageCircle, color: "#10B981" },
  shares: { label: "Shares", icon: Share2, color: "#A855F7" },
} as const;

export function MetricsChartV2({
  chartData,
  activeMetric,
  onActiveMetricChange,
}: MetricsChartV2Props) {
  const metricConfig = METRIC_CONFIG[activeMetric];
  const MetricIcon = metricConfig.icon;

  // Find the live point index for the pulsing dot
  const livePointIndex = chartData.findIndex((p) => p.isLive);
  const livePoint = livePointIndex >= 0 ? chartData[livePointIndex] : null;

  return (
    <Card className="p-4 sm:p-6 border border-primary/10 shadow-md overflow-hidden">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>

        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <MetricIcon
            className="h-4 w-4"
            style={{ color: metricConfig.color }}
          />
          <span>{metricConfig.label}</span>
          {livePoint && (
            <span className="flex items-center gap-1 ml-auto text-xs">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: metricConfig.color }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: metricConfig.color }}
                />
              </span>
              Live
            </span>
          )}
        </div>

        <Tabs
          value={activeMetric}
          onValueChange={(v) => onActiveMetricChange(v as MetricType)}
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="views" className="gap-1.5">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Views</span>
            </TabsTrigger>
            <TabsTrigger value="likes" className="gap-1.5">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Likes</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
            </TabsTrigger>
            <TabsTrigger value="shares" className="gap-1.5">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Shares</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <motion.div
        className="h-60 sm:h-80 bg-white dark:bg-muted/30 rounded-lg p-2 sm:p-4 border border-border/30 shadow-sm"
        key={activeMetric}
        variants={chartVariants}
        initial="hidden"
        animate="visible"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGradientV2" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={metricConfig.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={metricConfig.color}
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="dark:stroke-gray-700 stroke-gray-200"
              opacity={0.3}
            />
            <XAxis
              dataKey="label"
              className="dark:fill-gray-400 fill-gray-500"
              tick={{
                className: "dark:fill-gray-400 fill-gray-500",
                fontSize: 12,
              }}
              axisLine={{
                className: "dark:stroke-gray-700 stroke-gray-300",
              }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCompactNumber}
              className="dark:fill-gray-400 fill-gray-500"
              tick={{
                className: "dark:fill-gray-400 fill-gray-500",
                fontSize: 12,
              }}
              axisLine={{
                className: "dark:stroke-gray-700 stroke-gray-300",
              }}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                padding: "8px 12px",
                color: "var(--foreground)",
              }}
              labelStyle={{
                color: "var(--foreground)",
                fontWeight: 600,
                marginBottom: "4px",
              }}
              itemStyle={{ color: "var(--foreground)", fontSize: 14 }}
              formatter={(value: number) => [
                value.toLocaleString(),
                metricConfig.label,
              ]}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={metricConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorGradientV2)"
              activeDot={{
                r: 6,
                stroke: metricConfig.color,
                strokeWidth: 2,
                fill: "var(--background)",
              }}
            />
            {/* Pulsing dot for live point */}
            {livePoint && (
              <ReferenceDot
                x={livePoint.label}
                y={livePoint[activeMetric]}
                r={6}
                fill={metricConfig.color}
                stroke="var(--background)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}
