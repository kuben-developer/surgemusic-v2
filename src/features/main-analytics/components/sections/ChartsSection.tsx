import { motion } from "framer-motion";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import type { MetricKey, VideoMetric } from '@/components/analytics/types';
import { fadeInUp, metricInfo } from '../../constants/metrics.constants';

interface ChartsSectionProps {
  // Chart props
  dailyData: any[];
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    totalVideos: number;
  };
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
  dateRange: string;
  viewsGrowth: { value: number; isPositive: boolean };
  likesGrowth: { value: number; isPositive: boolean };
  commentsGrowth: { value: number; isPositive: boolean };
  sharesGrowth: { value: number; isPositive: boolean };

  // Top content props
  videoMetrics: VideoMetric[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

/**
 * Charts and top content section component
 * Displays performance charts and top performing content
 */
export function ChartsSection({
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
}: ChartsSectionProps) {
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