"use client";

import { motion } from "framer-motion";
import { KPIMetricCardV2 } from "./KPIMetricCardV2";
import { KPI_METRICS_V2, fadeInUp } from "../constants/metrics-v2";
import type { AdjustedTotals } from "../types/analytics-v2.types";

interface KPIMetricsV2Props {
  totals: AdjustedTotals;
}

// Mobile: Posts & Views = 3 cols each (row 1), Likes/Comments/Shares/Saves = 2 cols each (row 2)
const MOBILE_COL_SPANS: Record<string, string> = {
  posts: "col-span-3 sm:col-span-1",
  views: "col-span-3 sm:col-span-1",
  likes: "col-span-2 sm:col-span-1",
  comments: "col-span-2 sm:col-span-1",
  shares: "col-span-2 sm:col-span-1",
  saves: "col-span-3 sm:col-span-1",
};

export function KPIMetricsV2({ totals }: KPIMetricsV2Props) {
  return (
    <motion.section
      variants={fadeInUp}
      className="grid grid-cols-6 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3"
    >
      {KPI_METRICS_V2.map((config) => (
        <KPIMetricCardV2
          key={config.key}
          config={config}
          value={config.getValue(totals)}
          className={MOBILE_COL_SPANS[config.key]}
        />
      ))}
    </motion.section>
  );
}
