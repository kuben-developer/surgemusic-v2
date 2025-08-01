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
} from '@/types/analytics.types';

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
  const {
    // Base analytics props
    campaignCount,
    totalVideos,
    totals,
    avgEngagementRate,
    
    // Growth metrics
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    sharesGrowth,
    engagementGrowth,
    
    // Chart data props
    dailyData,
    activeMetric,
    setActiveMetric,
    dateRange,
    
    // Top content/pagination props
    videoMetrics,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    
    // Campaign filter props
    selectedCampaigns,
    campaigns
  } = props;

  return (
    <div className="space-y-8">
      <KpiSection 
        campaignCount={campaignCount}
        totalVideos={totalVideos}
        totals={totals}
        avgEngagementRate={avgEngagementRate}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        sharesGrowth={sharesGrowth}
        engagementGrowth={engagementGrowth}
      />
      
      <ChartsSection 
        dailyData={dailyData}
        totals={totals}
        activeMetric={activeMetric}
        setActiveMetric={setActiveMetric}
        dateRange={dateRange}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        sharesGrowth={sharesGrowth}
        videoMetrics={videoMetrics}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
      
      <CommentsSection 
        selectedCampaigns={selectedCampaigns}
        campaigns={campaigns}
      />
    </div>
  );
}