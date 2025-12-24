"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeInUp, KPI_METRICS, type KPIMetricData, type KPIMetricConfig } from "../constants/metrics";

interface KPIMetricsProps {
  data: KPIMetricData;
}

interface MetricCardProps {
  config: KPIMetricConfig;
  data: KPIMetricData;
  className?: string;
}

function MetricCard({ config, data, className = "" }: MetricCardProps) {
  const value = config.getValue(data);

  return (
    <Card className={`p-2.5 sm:p-6 space-y-1 sm:space-y-4 border border-primary/10 hover:border-primary/20 transition-colors ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] sm:text-sm font-medium text-muted-foreground">{config.label}</h3>
        <div className={`h-5 w-5 sm:h-8 sm:w-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
          <div className={`${config.iconColor} [&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-4 sm:[&>svg]:w-4`}>{config.icon}</div>
        </div>
      </div>
      <div>
        <p className="text-base sm:text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}

// Mobile column spans: Posts & Views = 3 cols each (row 1), Likes/Comments/Shares = 2 cols each (row 2)
const MOBILE_COL_SPANS: Record<string, string> = {
  posts: "col-span-3 sm:col-span-1",
  views: "col-span-3 sm:col-span-1",
  likes: "col-span-2 sm:col-span-1",
  comments: "col-span-2 sm:col-span-1",
  shares: "col-span-2 sm:col-span-1",
};

export function KPIMetrics({ data }: KPIMetricsProps) {
  return (
    <motion.section
      variants={fadeInUp}
      className="grid grid-cols-6 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4"
    >
      {KPI_METRICS.map((config) => (
        <MetricCard
          key={config.key}
          config={config}
          data={data}
          className={MOBILE_COL_SPANS[config.key]}
        />
      ))}
    </motion.section>
  );
}
