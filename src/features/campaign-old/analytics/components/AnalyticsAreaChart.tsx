"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { METRIC_INFO, chartVariants } from "../constants/metrics";
import type { AnalyticsData } from "../types/analytics.types";

interface AnalyticsAreaChartProps {
  dailyData: AnalyticsData['dailyData'];
  activeMetric: string;
}

export function AnalyticsAreaChart({ dailyData, activeMetric }: AnalyticsAreaChartProps) {
  const metricInfo = METRIC_INFO[activeMetric as keyof typeof METRIC_INFO];
  
  if (!metricInfo) {
    return (
      <div className="h-80 bg-white dark:bg-muted/30 rounded-lg p-4 border border-border/30 shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Invalid metric selected</p>
      </div>
    );
  }

  // TypeScript assertion after null check - we know metricInfo is defined here
  const safeMetricInfo = metricInfo;
  
  return (
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
                stopColor={safeMetricInfo.color}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={safeMetricInfo.color}
                stopOpacity={0.2}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700 stroke-gray-200" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            className="dark:fill-gray-400 fill-gray-500"
            tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 12 }}
            axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
            tickLine={false}
          />
          <YAxis
            className="dark:fill-gray-400 fill-gray-500"
            tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 12 }}
            axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
            tickLine={false}
            width={40}
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
            formatter={(value) => [value.toLocaleString(), safeMetricInfo.label]}
            labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          />
          <Area
            type="monotone"
            dataKey={activeMetric}
            stroke={safeMetricInfo.color}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorGradient)"
            activeDot={{
              r: 6,
              stroke: safeMetricInfo.color,
              strokeWidth: 2,
              fill: 'var(--background)'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}