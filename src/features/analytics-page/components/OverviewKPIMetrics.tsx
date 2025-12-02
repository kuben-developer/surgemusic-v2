"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeInUp, OVERVIEW_KPI_METRICS } from "../constants/analytics-page.constants";
import type { OverviewKPIMetricsProps } from "../types/analytics-page.types";

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
      {OVERVIEW_KPI_METRICS.map((config) => {
        const value = config.getValue(totals);

        return (
          <Card
            key={config.key}
            className="p-4 space-y-3 border border-primary/10 hover:border-primary/20 transition-colors"
          >
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
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </Card>
        );
      })}
    </motion.section>
  );
}
