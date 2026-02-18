"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useCounterAnimation } from "@/features/campaign/analytics-v2/hooks/useCounterAnimation";
import { fadeInUp, OVERVIEW_KPI_METRICS, type KPIMetricConfig } from "../constants/analytics-page.constants";
import type { AggregateTotals, OverviewKPIMetricsProps } from "../types/analytics-page.types";

/**
 * Single KPI card with animated counter.
 * Extracted as a separate component so useCounterAnimation can be called per card.
 */
function AnimatedKPICard({
  config,
  totals,
}: {
  config: KPIMetricConfig;
  totals: AggregateTotals;
}) {
  const rawValue = config.getValue(totals);
  const animatedValue = useCounterAnimation(rawValue);

  return (
    <Card className="p-4 space-y-3 border border-primary/10 hover:border-primary/20 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {config.label}
        </h3>
        <div
          className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center`}
        >
          <div className={config.iconColor}>{config.icon}</div>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">
          {animatedValue.toLocaleString()}
        </p>
      </div>
    </Card>
  );
}

/**
 * KPI Metrics grid for the overview page
 *
 * Shows aggregate metrics across all campaigns following
 * the campaign/analytics KPIMetrics pattern.
 */
export function OverviewKPIMetrics({ totals }: OverviewKPIMetricsProps) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {OVERVIEW_KPI_METRICS.map((config) => (
        <AnimatedKPICard key={config.key} config={config} totals={totals} />
      ))}
    </motion.section>
  );
}
