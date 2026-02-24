"use client";

import { motion } from "framer-motion";
import { KPIMetricCardV2 } from "./KPIMetricCardV2";
import { KPI_METRICS_V2, fadeInUp } from "../constants/metrics-v2";
import type { AdjustedTotals, PlatformFilter } from "../types/analytics-v2.types";

interface KPIMetricsV2Props {
  totals: AdjustedTotals;
  platform?: PlatformFilter;
}

// Keys hidden when platform is "instagram" (no shares/saves on IG)
const INSTAGRAM_HIDDEN_KEYS = new Set(["shares", "saves"]);

// Mobile: Posts & Views = 3 cols each (row 1), Likes/Comments/Shares/Saves = 2 cols each (row 2)
const MOBILE_COL_SPANS: Record<string, string> = {
  posts: "col-span-3 sm:col-span-1",
  views: "col-span-3 sm:col-span-1",
  likes: "col-span-2 sm:col-span-1",
  comments: "col-span-2 sm:col-span-1",
  shares: "col-span-2 sm:col-span-1",
  saves: "col-span-3 sm:col-span-1",
};

// When showing 4 cards (instagram), use different spans
const MOBILE_COL_SPANS_IG: Record<string, string> = {
  posts: "col-span-3 sm:col-span-1",
  views: "col-span-3 sm:col-span-1",
  likes: "col-span-3 sm:col-span-1",
  comments: "col-span-3 sm:col-span-1",
};

export function KPIMetricsV2({ totals, platform = "all" }: KPIMetricsV2Props) {
  const isInstagram = platform === "instagram";
  const metrics = isInstagram
    ? KPI_METRICS_V2.filter((m) => !INSTAGRAM_HIDDEN_KEYS.has(m.key))
    : KPI_METRICS_V2;

  const colSpans = isInstagram ? MOBILE_COL_SPANS_IG : MOBILE_COL_SPANS;
  const gridCols = isInstagram
    ? "grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
    : "grid grid-cols-6 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3";

  return (
    <motion.section variants={fadeInUp} className={gridCols}>
      {metrics.map((config) => (
        <KPIMetricCardV2
          key={config.key}
          config={config}
          value={config.getValue(totals)}
          className={colSpans[config.key]}
          snapKey={platform}
        />
      ))}
    </motion.section>
  );
}
