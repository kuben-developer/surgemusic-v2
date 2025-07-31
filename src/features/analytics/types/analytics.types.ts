import type { DailyData, Totals, VideoMetric } from '@/components/analytics/types';

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