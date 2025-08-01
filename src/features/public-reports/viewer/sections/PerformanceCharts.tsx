'use client';

import { motion } from "framer-motion";
import { PerformanceChartCard } from '@/components/analytics/PerformanceChartCard';
import { TopContentCard } from '@/components/analytics/TopContentCard';
import { EmptyContentState } from '../components/EmptyContentState';
import type { MetricKey, GrowthResult } from '../types';
import type { DailyData, Totals, VideoMetric } from '@/components/analytics/types';
import { metricInfo } from '../utils/metric-info';
import { animationVariants } from '../constants/animations.constants';

interface PerformanceChartsProps {
  dailyData: DailyData[];
  totals: Totals | undefined;
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
  dateRange: string;
  viewsGrowth: GrowthResult;
  likesGrowth: GrowthResult;
  commentsGrowth: GrowthResult;
  sharesGrowth: GrowthResult;
  visibleVideoMetrics: VideoMetric[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  hiddenVideoIds: string[];
}

export function PerformanceCharts({
  dailyData,
  totals,
  activeMetric,
  setActiveMetric,
  dateRange,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  sharesGrowth,
  visibleVideoMetrics,
  currentPage,
  itemsPerPage,
  onPageChange,
  hiddenVideoIds
}: PerformanceChartsProps) {
  return (
    <motion.div
      variants={animationVariants.fadeInUp}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <PerformanceChartCard
        dailyData={dailyData}
        totals={totals || { views: 0, likes: 0, comments: 0, shares: 0 }}
        activeMetric={activeMetric}
        setActiveMetric={setActiveMetric}
        metricInfo={metricInfo}
        dateRange={dateRange}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        sharesGrowth={sharesGrowth}
      />

      {visibleVideoMetrics.length > 0 ? (
        <TopContentCard
          videoMetrics={visibleVideoMetrics}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          hiddenVideoIds={hiddenVideoIds}
        />
      ) : (
        <EmptyContentState />
      )}
    </motion.div>
  );
}