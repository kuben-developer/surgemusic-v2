'use client';

import { KpiSection } from './sections/KpiSection';
import { ChartsSection } from './sections/ChartsSection';
import { CommentsSection } from './sections/CommentsSection';
import type { 
  BaseAnalyticsProps,
  GrowthMetrics,
  ChartDataProps,
  TopContentProps,
  CampaignFilterProps
} from '../types/analytics.types';

interface AnalyticsGridProps extends 
  BaseAnalyticsProps,
  GrowthMetrics,
  ChartDataProps,
  TopContentProps,
  CampaignFilterProps {}

/**
 * Main analytics grid component that orchestrates all analytics sections
 */
export function AnalyticsGrid(props: AnalyticsGridProps) {
  // Compose KPI props
  const kpiProps = {
    campaignCount: props.campaignCount,
    totalVideos: props.totalVideos,
    totals: props.totals,
    avgEngagementRate: props.avgEngagementRate,
    viewsGrowth: props.viewsGrowth,
    likesGrowth: props.likesGrowth,
    commentsGrowth: props.commentsGrowth,
    engagementGrowth: props.engagementGrowth
  };

  // Compose chart props
  const chartProps = {
    dailyData: props.dailyData,
    totals: props.totals,
    activeMetric: props.activeMetric,
    setActiveMetric: props.setActiveMetric,
    dateRange: props.dateRange,
    viewsGrowth: props.viewsGrowth,
    likesGrowth: props.likesGrowth,
    commentsGrowth: props.commentsGrowth,
    sharesGrowth: props.sharesGrowth,
    videoMetrics: props.videoMetrics,
    currentPage: props.currentPage,
    setCurrentPage: props.setCurrentPage,
    itemsPerPage: props.itemsPerPage
  };

  // Compose comments props
  const commentsProps = {
    selectedCampaigns: props.selectedCampaigns,
    campaigns: props.campaigns
  };
  return (
    <div className="space-y-8">
      <KpiSection {...kpiProps} />
      <ChartsSection {...chartProps} />
      <CommentsSection {...commentsProps} />
    </div>
  );
}