import type { DailyData, Totals, VideoMetric, MetricKey } from '@/components/analytics/types';

// Feature-specific types for analytics feature

export interface Campaign {
  id: string;
  _id?: string;
  campaignName: string;
}

export interface AnalyticsData {
  dailyData: DailyData[];
  totals: Totals & { totalVideos: number };
  avgEngagementRate: string;
  videoMetrics: VideoMetric[];
  campaigns: Campaign[];
  lastUpdatedAt: string | null;
}

// Shared prop types for better composition
export interface GrowthMetrics {
  viewsGrowth: { value: number; isPositive: boolean };
  likesGrowth: { value: number; isPositive: boolean };
  commentsGrowth: { value: number; isPositive: boolean };
  sharesGrowth: { value: number; isPositive: boolean };
  engagementGrowth: { value: number; isPositive: boolean };
}

export interface BaseAnalyticsProps {
  campaignCount: number;
  totalVideos: number;
  totals: Totals & { totalVideos: number };
  avgEngagementRate: string;
}

export interface ChartDataProps {
  dailyData: any[];
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
  dateRange: string;
}

export interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

export interface CampaignFilterProps {
  selectedCampaigns: string[];
  campaigns: any[];
}

export interface TopContentProps extends PaginationProps {
  videoMetrics: VideoMetric[];
}