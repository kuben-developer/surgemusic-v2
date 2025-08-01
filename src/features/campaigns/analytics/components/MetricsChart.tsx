"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricInfo } from "./MetricInfo";
import { MetricTabs } from "./MetricTabs";
import { AnalyticsAreaChart } from "./AnalyticsAreaChart";
import { MetricSummaryStats } from "./MetricSummaryStats";
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

        <MetricInfo activeMetric={activeMetric} />
        <MetricTabs activeMetric={activeMetric} onActiveMetricChange={onActiveMetricChange} />
      </div>

      <AnalyticsAreaChart dailyData={dailyData} activeMetric={activeMetric} />
      
      <MetricSummaryStats
        dailyData={dailyData}
        totals={totals}
        activeMetric={activeMetric}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        sharesGrowth={sharesGrowth}
      />
    </Card>
  );
}