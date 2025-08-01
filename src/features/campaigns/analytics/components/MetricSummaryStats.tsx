"use client";

import { ArrowUpRight } from "lucide-react";
import type { AnalyticsData, GrowthMetric } from "../types/analytics.types";

interface MetricSummaryStatsProps {
  dailyData: AnalyticsData['dailyData'];
  totals: AnalyticsData['totals'];
  activeMetric: string;
  viewsGrowth: GrowthMetric;
  likesGrowth: GrowthMetric;
  commentsGrowth: GrowthMetric;
  sharesGrowth: GrowthMetric;
}

export function MetricSummaryStats({
  dailyData,
  totals,
  activeMetric,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  sharesGrowth
}: MetricSummaryStatsProps) {
  // Get the growth data for active metric
  const getGrowthForMetric = (metric: string): GrowthMetric => {
    switch (metric) {
      case 'views': return viewsGrowth;
      case 'likes': return likesGrowth;
      case 'comments': return commentsGrowth;
      case 'shares': return sharesGrowth;
      default: return { value: 0, isPositive: true };
    }
  };

  const growth = getGrowthForMetric(activeMetric);

  return (
    <div className="mt-4 grid grid-cols-3 gap-4">
      <div className="rounded-lg bg-muted/30 p-3">
        <div className="text-xs text-muted-foreground mb-1">Total</div>
        <div className="text-lg font-semibold">{totals[activeMetric as keyof typeof totals].toLocaleString()}</div>
      </div>
      <div className="rounded-lg bg-muted/30 p-3">
        <div className="text-xs text-muted-foreground mb-1">Average</div>
        <div className="text-lg font-semibold">
          {Math.round(
            dailyData.reduce((sum: number, day) => sum + (day[activeMetric as keyof typeof day] as number), 0) /
            (dailyData.length || 1)
          ).toLocaleString()}
        </div>
      </div>
      <div className="rounded-lg bg-muted/30 p-3">
        <div className="text-xs text-muted-foreground mb-1">Trend</div>
        <div className="flex items-center gap-1">
          <div className={`text-lg font-semibold ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {growth.isPositive ? '+' : ''}{growth.value.toFixed(1)}%
          </div>
          <ArrowUpRight className={`h-3 w-3 ${growth.isPositive ? 'text-green-600' : 'text-red-600 rotate-90'}`} />
        </div>
      </div>
    </div>
  );
}