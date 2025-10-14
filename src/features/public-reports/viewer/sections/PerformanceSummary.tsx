'use client';

import { motion } from "framer-motion";
import { KpiMetricsGrid } from '@/components/analytics/KpiMetricsGrid';
import type { GrowthResult } from '../types';
import type { Totals } from '@/components/analytics/types';

interface PerformanceSummaryProps {
  campaignCount: number;
  totalVideos: number | undefined;
  totals: Totals | undefined;
  viewsGrowth: GrowthResult;
  likesGrowth: GrowthResult;
  commentsGrowth: GrowthResult;
  sharesGrowth: GrowthResult;
  engagementGrowth: GrowthResult;
  avgEngagementRate: string;
}

export function PerformanceSummary({
  campaignCount,
  totalVideos,
  totals,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  sharesGrowth,
  engagementGrowth,
  avgEngagementRate
}: PerformanceSummaryProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2 md:space-y-3"
    >
      <h2 className="text-lg md:text-xl font-semibold">Performance Summary</h2>
      <KpiMetricsGrid
        campaignsCount={campaignCount}
        totalVideos={totalVideos || 0}
        totals={totals || { views: 0, likes: 0, comments: 0, shares: 0 }}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        engagementGrowth={engagementGrowth}
        avgEngagementRate={avgEngagementRate}
        sharesGrowth={sharesGrowth}
      />
    </motion.section>
  );
}