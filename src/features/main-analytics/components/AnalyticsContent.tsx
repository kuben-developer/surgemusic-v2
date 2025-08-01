'use client';

import { motion } from "framer-motion";
import type { MetricKey } from '@/components/analytics/types';
import type { AnalyticsData } from '../types/analytics.types';
import { staggerContainer } from '../constants/metrics.constants';
import { useAnalyticsTransform } from '../hooks/useAnalyticsTransform';
import { useMetricCalculations } from '../hooks/useMetricCalculations';
import { LoadingStates } from './LoadingStates';
import { ErrorStates } from './ErrorStates';
import { AnalyticsGrid } from './AnalyticsGrid';

interface AnalyticsContentProps {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  dateRange: string;
  selectedCampaigns: string[];
  refetchAnalytics: () => Promise<void>;
}

export function AnalyticsContent({
  data,
  isLoading,
  error,
  activeMetric,
  setActiveMetric,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  dateRange,
  selectedCampaigns,
  refetchAnalytics
}: AnalyticsContentProps) {
  // Transform raw data using custom hook
  const transformedData = useAnalyticsTransform(data);
  
  // Calculate metric growth values using custom hook
  const metricCalculations = useMetricCalculations(transformedData.dailyData);

  // Loading state
  if (isLoading && !data) {
    return <LoadingStates type="content" />;
  }

  // Error state
  if (error) {
    return <ErrorStates error={error} onRetry={refetchAnalytics} type="error" />;
  }

  // No data state
  if (!isLoading && !data) {
    return <ErrorStates type="no-data" />;
  }

  return (
    <motion.div 
      className="space-y-8" 
      initial="initial" 
      animate="animate" 
      variants={staggerContainer}
    >
      <AnalyticsGrid
        campaignCount={transformedData.campaignCount}
        totalVideos={transformedData.totalVideos}
        totals={transformedData.totals}
        viewsGrowth={metricCalculations.viewsGrowth}
        likesGrowth={metricCalculations.likesGrowth}
        commentsGrowth={metricCalculations.commentsGrowth}
        engagementGrowth={metricCalculations.engagementGrowth}
        avgEngagementRate={transformedData.avgEngagementRate}
        dailyData={transformedData.dailyData}
        activeMetric={activeMetric}
        setActiveMetric={setActiveMetric}
        dateRange={dateRange}
        sharesGrowth={metricCalculations.sharesGrowth}
        videoMetrics={transformedData.mappedVideoMetrics}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        selectedCampaigns={selectedCampaigns}
        campaigns={transformedData.campaigns}
      />
    </motion.div>
  );
}