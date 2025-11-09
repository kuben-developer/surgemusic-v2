"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Eye, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { chartVariants } from "../constants/metrics";
import type { MetricType } from "../types/analytics.types";

interface MetricsChartProps {
  dailyData: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }>;
  activeMetric: MetricType;
  onActiveMetricChange: (metric: MetricType) => void;
}

const METRIC_CONFIG = {
  views: {
    label: "Views",
    icon: Eye,
    color: "#3B82F6",
  },
  likes: {
    label: "Likes",
    icon: Heart,
    color: "#EF4444",
  },
  comments: {
    label: "Comments",
    icon: MessageCircle,
    color: "#10B981",
  },
  shares: {
    label: "Shares",
    icon: Share2,
    color: "#A855F7",
  },
  saves: {
    label: "Saves",
    icon: Bookmark,
    color: "#EAB308",
  },
} as const;

export function MetricsChart({
  dailyData,
  activeMetric,
  onActiveMetricChange,
}: MetricsChartProps) {
  const metricConfig = METRIC_CONFIG[activeMetric];
  const MetricIcon = metricConfig.icon;

  return (
    <Card className="p-6 border border-primary/10 shadow-md overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>

        {/* Metric Info */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <MetricIcon className="h-4 w-4" style={{ color: metricConfig.color }} />
          <span>{metricConfig.label}</span>
        </div>

        {/* Metric Tabs */}
        <Tabs value={activeMetric} onValueChange={(value) => onActiveMetricChange(value as MetricType)}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="views">
              <Eye className="h-4 w-4 mr-1.5" />
              Views
            </TabsTrigger>
            <TabsTrigger value="likes">
              <Heart className="h-4 w-4 mr-1.5" />
              Likes
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="shares">
              <Share2 className="h-4 w-4 mr-1.5" />
              Shares
            </TabsTrigger>
            <TabsTrigger value="saves">
              <Bookmark className="h-4 w-4 mr-1.5" />
              Saves
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chart */}
      <motion.div
        className="h-80 bg-white dark:bg-muted/30 rounded-lg p-4 border border-border/30 shadow-sm"
        key={activeMetric}
        variants={chartVariants}
        initial="hidden"
        animate="visible"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
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
            <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700 stroke-gray-200" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={(date: string) => {
                const parts = date.split('-');
                const day = parseInt(parts[0] || '0', 10);
                const month = parseInt(parts[1] || '0', 10);
                const year = parseInt(parts[2] || '0', 10);
                return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              className="dark:fill-gray-400 fill-gray-500"
              tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 12 }}
              axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => value.toLocaleString()}
              className="dark:fill-gray-400 fill-gray-500"
              tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 12 }}
              axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
              tickLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '8px 12px',
                color: 'var(--foreground)'
              }}
              labelStyle={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'var(--foreground)', fontSize: 14 }}
              formatter={(value: number) => [value.toLocaleString(), metricConfig.label]}
              labelFormatter={(date: string) => {
                const parts = date.split('-');
                const day = parseInt(parts[0] || '0', 10);
                const month = parseInt(parts[1] || '0', 10);
                const year = parseInt(parts[2] || '0', 10);
                return new Date(year, month - 1, day).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={metricConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorGradient)"
              activeDot={{
                r: 6,
                stroke: metricConfig.color,
                strokeWidth: 2,
                fill: 'var(--background)'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}
