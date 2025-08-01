'use client';

import { motion } from "framer-motion";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { fadeInUp } from '../../constants/metrics.constants';
import type { BaseAnalyticsProps, GrowthMetrics } from '../../types/analytics.types';

interface KpiSectionProps extends BaseAnalyticsProps, GrowthMetrics {}

/**
 * KPI metrics section component
 * Displays key performance indicators in a grid layout
 */
export function KpiSection(props: KpiSectionProps) {
  const {
    campaignCount,
    totalVideos,
    totals,
    avgEngagementRate,
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    engagementGrowth
  } = props;
  return (
    <motion.div variants={fadeInUp}>
      <KpiMetricsGrid
        campaignsCount={campaignCount}
        totalVideos={totalVideos}
        totals={totals}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        engagementGrowth={engagementGrowth}
        avgEngagementRate={avgEngagementRate}
      />
    </motion.div>
  );
}