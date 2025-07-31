'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { toast } from 'sonner';
import type { PublicReportContentProps, MetricKey } from '../../shared/types';
import { useReportData } from '../hooks/useReportData';
import { useMetricCalculations } from '../hooks/useMetricCalculations';
import { usePagination } from '../hooks/usePagination';
import { ITEMS_PER_PAGE, VALID_SHARE_ID_REGEX } from '../constants/metrics.constants';
import { ReportHeader } from './ReportHeader';
import { DateRangeSelector } from './DateRangeSelector';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { PerformanceSummary } from '../sections/PerformanceSummary';
import { PerformanceCharts } from '../sections/PerformanceCharts';
import { CommentsView } from '../sections/CommentsView';

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function PublicReportContent({ shareId }: PublicReportContentProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<string>("30");
  const [retryCount, setRetryCount] = useState(0);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("views");
  const { currentPage, setCurrentPage, itemsPerPage } = usePagination(ITEMS_PER_PAGE);

  // Validate share ID format
  useEffect(() => {
    if (shareId && !VALID_SHARE_ID_REGEX.test(shareId)) {
      toast.error("Invalid share ID format");
      router.push('/public/reports');
    }
  }, [shareId, router]);

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

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
    toast.info("Retrying to fetch report data...");
  };

  // Handle navigation back
  const handleBack = () => router.push('/public/reports');

  // Loading state
  if (isLoading || isRefetching) {
    return <LoadingState isRefetching={isRefetching} />;
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} onRetry={handleRetry} retryCount={retryCount} />;
  }

  // Empty data state
  if (!data || !data.reportName) {
    return <EmptyState onBack={handleBack} />;
  }

  // Content state
  return (
    <motion.div
      className="pt-8 pb-16 space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Report Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
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
      <motion.div variants={fadeInUp} className="border-t pt-6 text-center text-sm text-muted-foreground">
        <p>This report is shared in read-only mode. Contact the owner for more information.</p>
      </motion.div>
    </motion.div>
  );
}