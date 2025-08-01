'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import type { PublicReportContentProps, MetricKey } from '../types';
import { useReportData } from '../hooks/useReportData';
import { useMetricCalculations } from '../hooks/useMetricCalculations';
import { usePagination } from '../hooks/usePagination';
import { useShareIdValidation } from '../hooks/useShareIdValidation';
import { useReportNavigation } from '../hooks/useReportNavigation';
import { ITEMS_PER_PAGE } from '../constants/metrics.constants';
import { animationVariants } from '../constants/animations.constants';
import { AnimatedReportLayout } from './AnimatedReportLayout';
import { ReportHeader } from './ReportHeader';
import { DateRangeSelector } from './DateRangeSelector';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { PerformanceSummary } from '../sections/PerformanceSummary';
import { PerformanceCharts } from '../sections/PerformanceCharts';
import { CommentsView } from '../sections/CommentsView';


export function PublicReportContent({ shareId }: PublicReportContentProps) {
  const [dateRange, setDateRange] = useState<string>("30");
  const [retryCount, setRetryCount] = useState(0);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("views");
  const { currentPage, setCurrentPage, itemsPerPage } = usePagination(ITEMS_PER_PAGE);
  
  // Custom hooks for validation and navigation
  useShareIdValidation(shareId);
  const { handleBack, handleRetry } = useReportNavigation();

  // Fetch report data
  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch
  } = useReportData(shareId, dateRange);

  // Calculate metrics
  const {
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    sharesGrowth,
    engagementGrowth,
    visibleVideoMetrics,
    campaignCount,
    totals,
    totalVideos
  } = useMetricCalculations(data);

  // Handle retry with retry count tracking
  const handleRetryWithCount = () => {
    setRetryCount(prev => prev + 1);
    handleRetry(refetch);
  };

  // Loading state
  if (isLoading || isRefetching) {
    return <LoadingState isRefetching={isRefetching} />;
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} onRetry={handleRetryWithCount} retryCount={retryCount} />;
  }

  // Empty data state
  if (!data || !data.reportName) {
    return <EmptyState onBack={handleBack} />;
  }

  // Content state
  return (
    <AnimatedReportLayout>
      {/* Report Header */}
      <motion.div variants={animationVariants.fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <ReportHeader 
          reportName={data.reportName} 
          reportCreatedAt={data.reportCreatedAt}
        />
        <DateRangeSelector 
          value={dateRange} 
          onChange={setDateRange}
        />
      </motion.div>

      {/* Performance Summary */}
      <PerformanceSummary
        campaignCount={campaignCount}
        totalVideos={totalVideos}
        totals={totals}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        sharesGrowth={sharesGrowth}
        engagementGrowth={engagementGrowth}
        avgEngagementRate={data.avgEngagementRate}
      />

      {/* Performance Charts and Top Content */}
      <PerformanceCharts
        dailyData={data.dailyData || []}
        totals={totals}
        activeMetric={activeMetric}
        setActiveMetric={setActiveMetric}
        dateRange={dateRange}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        sharesGrowth={sharesGrowth}
        visibleVideoMetrics={visibleVideoMetrics}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        hiddenVideoIds={data.hiddenVideoIds || []}
      />

      {/* Comments Section */}
      <CommentsView 
        campaignIds={data.campaigns?.map((c) => c.id)}
      />

      {/* Report Footer */}
      <motion.div variants={animationVariants.fadeInUp} className="border-t pt-6 text-center text-sm text-muted-foreground">
        <p>This report is shared in read-only mode. Contact the owner for more information.</p>
      </motion.div>
    </AnimatedReportLayout>
  );
}