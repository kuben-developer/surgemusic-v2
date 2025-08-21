'use client';

import type { PublicReportContentProps } from '../types';
import { useReportData } from '../hooks/useReportData';
import { useMetricCalculations } from '../hooks/useMetricCalculations';
import { usePublicReportState } from '../hooks/usePublicReportState';
import { AnimatedReportLayout } from './AnimatedReportLayout';
import { ReportHeaderWithDateRange } from './ReportHeaderWithDateRange';
import { ReportFooter } from './ReportFooter';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { PerformanceSummary } from '../sections/PerformanceSummary';
import { PerformanceCharts } from '../sections/PerformanceCharts';
import { CommentsView } from '../sections/CommentsView';


export function PublicReportContent({ shareId }: PublicReportContentProps) {
  // Consolidated state management
  const {
    dateRange,
    retryCount,
    activeMetric,
    currentPage,
    itemsPerPage,
    setActiveMetric,
    setCurrentPage,
    handleDateRangeChange,
    handleBack,
    handleRetryWithCount
  } = usePublicReportState(shareId);

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

  // Loading state
  if (isLoading || isRefetching) {
    return <LoadingState isRefetching={isRefetching} />;
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} onRetry={() => handleRetryWithCount(refetch)} retryCount={retryCount} />;
  }

  // Empty data state
  if (!data || !data.reportName) {
    return <EmptyState onBack={handleBack} />;
  }

  // Content state
  return (
    <AnimatedReportLayout>
      {/* Report Header with Date Range */}
      <ReportHeaderWithDateRange
        reportName={data.reportName}
        reportCreatedAt={new Date(data.reportCreatedAt).toISOString()}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

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
        visibleVideoMetrics={visibleVideoMetrics || []}
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
      <ReportFooter />
    </AnimatedReportLayout>
  );
}