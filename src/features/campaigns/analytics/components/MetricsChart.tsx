import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { METRIC_INFO, chartVariants } from "../constants/metrics";
import type { AnalyticsData, GrowthMetric } from "../types/analytics.types";

interface MetricsChartProps {
  dailyData: AnalyticsData['dailyData'];
  totals: AnalyticsData['totals'];
  dateRange: string;
  activeMetric: string;
  onActiveMetricChange: (metric: string) => void;
  viewsGrowth: GrowthMetric;
  likesGrowth: GrowthMetric;
  commentsGrowth: GrowthMetric;
  sharesGrowth: GrowthMetric;
}

export function MetricsChart({
  dailyData,
  totals,
  dateRange,
  activeMetric,
  onActiveMetricChange,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  sharesGrowth,
}: MetricsChartProps) {
  return (
    <Card className="p-6 border border-primary/10 shadow-md overflow-hidden">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Performance Metrics</h3>
          <Badge variant="outline" className="bg-primary/5 text-primary">
            {dateRange} Day Trend
          </Badge>
        </div>

        {/* Metric Info Display */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].color}20` }}>
            <div className="flex items-center justify-center h-6 w-6 text-primary" style={{ color: METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].color }}>
              {METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].icon}
            </div>
          </div>
          <div>
            <h4 className="font-medium">{METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].label}</h4>
            <p className="text-xs text-muted-foreground">{METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].description}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-4 bg-muted/50 rounded-lg p-1 backdrop-blur-sm">
          {Object.keys(METRIC_INFO).map((metric) => (
            <button
              key={metric}
              className={cn(
                "flex-1 py-2 px-3 text-sm rounded-md transition-all relative overflow-hidden",
                activeMetric === metric
                  ? "text-white font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onActiveMetricChange(metric)}
            >
              {activeMetric === metric && (
                <motion.div
                  className="absolute inset-0 rounded-md -z-10"
                  layoutId="activeTab"
                  style={{ backgroundColor: METRIC_INFO[metric as keyof typeof METRIC_INFO].color }}
                  initial={false}
                />
              )}
              <div className="flex items-center justify-center gap-2">
                {METRIC_INFO[metric as keyof typeof METRIC_INFO].icon}
                <span>{METRIC_INFO[metric as keyof typeof METRIC_INFO].label}</span>
              </div>
            </button>
          ))}
        </div>
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
                  stopColor={METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].color}
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
              formatter={(value) => [value.toLocaleString(), METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].label]}
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorGradient)"
              activeDot={{
                r: 6,
                stroke: METRIC_INFO[activeMetric as keyof typeof METRIC_INFO].color,
                strokeWidth: 2,
                fill: 'var(--background)'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground mb-1">Total</div>
          <div className="text-lg font-semibold">{totals[activeMetric as keyof typeof totals].toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground mb-1">Average</div>
          <div className="text-lg font-semibold">
            {Math.round(
              dailyData.reduce((sum: number, day: any) => sum + (day[activeMetric as keyof typeof day] as number), 0) /
              (dailyData.length || 1)
            ).toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground mb-1">Trend</div>
          <div className="flex items-center gap-1">
            {(() => {
              // Get the growth data for active metric
              let growth: GrowthMetric;
              switch (activeMetric) {
                case 'views': growth = viewsGrowth; break;
                case 'likes': growth = likesGrowth; break;
                case 'comments': growth = commentsGrowth; break;
                case 'shares': growth = sharesGrowth; break;
                default: growth = { value: 0, isPositive: true };
              }

              if (growth.value === 0) {
                return <span className="text-lg font-semibold">--</span>;
              }

              return (
                <>
                  {growth.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 rotate-180 text-red-500" />
                  )}
                  <span className={`text-lg font-semibold ${growth.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {growth.isPositive ? '+' : '-'}{growth.value}%
                  </span>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </Card>
  );
}