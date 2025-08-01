import { motion } from "framer-motion";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import { CommentsSection } from "@/components/analytics/CommentsSection";
import type { MetricKey, VideoMetric } from '@/components/analytics/types';
import { fadeInUp, metricInfo } from '../constants/metrics.constants';

interface AnalyticsGridProps {
  // KPI Metrics props
  campaignCount: number;
  totalVideos: number;
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    totalVideos: number;
  };
  viewsGrowth: { value: number; isPositive: boolean };
  likesGrowth: { value: number; isPositive: boolean };
  commentsGrowth: { value: number; isPositive: boolean };
  engagementGrowth: { value: number; isPositive: boolean };
  avgEngagementRate: string;

  // Chart props
  dailyData: any[];
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
  dateRange: string;
  sharesGrowth: { value: number; isPositive: boolean };

  // Top content props
  videoMetrics: VideoMetric[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;

  // Comments props
  selectedCampaigns: string[];
  campaigns: any[];
}

/**
 * Main analytics grid component that orchestrates all analytics sections
 */
export function AnalyticsGrid({
  campaignCount,
  totalVideos,
  totals,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  engagementGrowth,
  avgEngagementRate,
  dailyData,
  activeMetric,
  setActiveMetric,
  dateRange,
  sharesGrowth,
  videoMetrics,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  selectedCampaigns,
  campaigns
}: AnalyticsGridProps) {
  return (
    <>
      {/* KPI Metrics Section */}
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

      {/* Charts and Top Content Section */}
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

      {/* Comments Section */}
      <motion.div variants={fadeInUp}>
        <CommentsSection 
          campaignIds={selectedCampaigns.length > 0 ? selectedCampaigns : campaigns.map((c: any) => c._id)}
        />
      </motion.div>
    </>
  );
}