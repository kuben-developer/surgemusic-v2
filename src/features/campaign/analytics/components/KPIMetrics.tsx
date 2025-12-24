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
}

function MetricCard({ config, data }: MetricCardProps) {
  const value = config.getValue(data);

  return (
    <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{config.label}</h3>
        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
          <div className={config.iconColor}>{config.icon}</div>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xl sm:text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}

export function KPIMetrics({ data }: KPIMetricsProps) {
  return (
    <motion.section
      variants={fadeInUp}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
    >
      {KPI_METRICS.map((config) => (
        <MetricCard key={config.key} config={config} data={data} />
      ))}
    </motion.section>
  );
}
