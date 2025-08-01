import { KpiSection } from './sections/KpiSection';
import { ChartsSection } from './sections/ChartsSection';
import { CommentsSection } from './sections/CommentsSection';
import type { MetricKey, VideoMetric } from '@/components/analytics/types';
import { staggerContainer } from '../constants/metrics.constants';

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
    <div className="space-y-8">
      <KpiSection
        campaignCount={campaignCount}
        totalVideos={totalVideos}
        totals={totals}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        engagementGrowth={engagementGrowth}
        avgEngagementRate={avgEngagementRate}
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