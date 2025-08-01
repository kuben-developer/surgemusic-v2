"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, KPI_METRICS, type KPIMetricData, type KPIMetricConfig } from "../constants/metrics";
import type { AnalyticsData, GrowthMetric } from "../types/analytics.types";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface KPIMetricsProps {
  totals: AnalyticsData['totals'];
  avgEngagementRate: string;
  generatedVideos: Doc<"generatedVideos">[] | undefined;
  viewsGrowth: GrowthMetric;
  likesGrowth: GrowthMetric;
  commentsGrowth: GrowthMetric;
  sharesGrowth: GrowthMetric;
  engagementGrowth: GrowthMetric;
}

interface MetricCardProps {
  config: KPIMetricConfig;
  data: KPIMetricData;
}

function MetricCard({ config, data }: MetricCardProps) {
  const value = config.getValue(data);
  const growth = config.getGrowth?.(data);

  return (
    <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{config.label}</h3>
        <div className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
          <div className={config.iconColor}>{config.icon}</div>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        {growth && growth.value > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpRight className={`h-3 w-3 ${
              growth.isPositive 
                ? "text-green-600 dark:text-green-400" 
                : "rotate-180 text-red-600 dark:text-red-400"
            }`} />
            <span className={growth.isPositive 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
            }>
              {growth.value}%
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

export function KPIMetrics({
  totals,
  avgEngagementRate,
  generatedVideos,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  sharesGrowth,
  engagementGrowth,
}: KPIMetricsProps) {
  const data: KPIMetricData = {
    totals,
    avgEngagementRate,
    generatedVideos,
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    sharesGrowth,
    engagementGrowth,
  };

  return (
    <motion.section
      variants={fadeInUp}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {KPI_METRICS.map((config) => (
        <MetricCard key={config.key} config={config} data={data} />
      ))}
    </motion.section>
  );
}