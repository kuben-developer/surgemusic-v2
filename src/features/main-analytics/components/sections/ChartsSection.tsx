'use client';

import { motion } from "framer-motion";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import { fadeInUp, metricInfo } from '../../constants/metrics.constants';
import type { 
  ChartDataProps, 
  TopContentProps,
  GrowthMetrics 
} from '../../types/analytics.types';
import type { Totals } from '@/components/analytics/types';

interface ChartsSectionProps extends ChartDataProps, TopContentProps {
  totals: Totals & { totalVideos: number };
  viewsGrowth: GrowthMetrics['viewsGrowth'];
  likesGrowth: GrowthMetrics['likesGrowth'];
  commentsGrowth: GrowthMetrics['commentsGrowth'];
  sharesGrowth: GrowthMetrics['sharesGrowth'];
}

/**
 * Charts and top content section component
 * Displays performance charts and top performing content
 */
export function ChartsSection(props: ChartsSectionProps) {
  const {
    dailyData,
    totals,
    activeMetric,
    setActiveMetric,
    dateRange,
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    sharesGrowth,
    videoMetrics,
    currentPage,
    setCurrentPage,
    itemsPerPage
  } = props;
  return (
    <motion.div
      variants={fadeInUp}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <PerformanceChartCard
        dailyData={dailyData}
        totals={totals}
        activeMetric={activeMetric}
        setActiveMetric={setActiveMetric}
        metricInfo={metricInfo}
        dateRange={dateRange}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        sharesGrowth={sharesGrowth}
      />

      <TopContentCard
        videoMetrics={videoMetrics}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );
}