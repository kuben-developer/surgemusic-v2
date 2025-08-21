"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format } from "date-fns";
import type { DailyMetric, MetricKey } from "../types/analytics.types";

interface MetricsChartProps {
  data: DailyMetric[];
  activeMetric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
  dateRange: number;
}

export function MetricsChart({ 
  data, 
  activeMetric, 
  onMetricChange,
  dateRange 
}: MetricsChartProps) {
  const metrics: { key: MetricKey; label: string; color: string }[] = [
    { key: 'views', label: 'Views', color: '#3b82f6' },
    { key: 'likes', label: 'Likes', color: '#ef4444' },
    { key: 'comments', label: 'Comments', color: '#10b981' },
    { key: 'shares', label: 'Shares', color: '#8b5cf6' },
  ];

  const activeMetricConfig = metrics.find(m => m.key === activeMetric)!;

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    if (dateRange <= 7) {
      return format(date, 'EEE');
    } else if (dateRange <= 30) {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MMM d');
    }
  };

  const formatTooltipDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d, yyyy');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Performance Trends</h3>
        <Tabs value={activeMetric} onValueChange={(v) => onMetricChange(v as MetricKey)}>
          <TabsList className="grid grid-cols-4 w-[400px]">
            {metrics.map(metric => (
              <TabsTrigger key={metric.key} value={metric.key}>
                {metric.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart 
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`color-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeMetricConfig.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={activeMetricConfig.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date"
            tickFormatter={formatXAxis}
            className="text-xs"
          />
          <YAxis 
            tickFormatter={formatNumber}
            className="text-xs"
          />
          <Tooltip
            labelFormatter={formatTooltipDate}
            formatter={(value: number) => [formatNumber(value), activeMetricConfig.label]}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Area
            type="monotone"
            dataKey={activeMetric}
            stroke={activeMetricConfig.color}
            fill={`url(#color-${activeMetric})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}