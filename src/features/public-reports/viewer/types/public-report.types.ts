import type { Doc, Id } from "convex/_generated/dataModel";
import type { Totals } from '@/components/analytics/types';

// Error types for public reports
export type PublicReportErrorType = 'NOT_FOUND' | 'EXPIRED' | 'SERVER_ERROR' | 'NETWORK' | 'UNKNOWN';

// Proper error interface to replace 'any' type
export interface PublicReportError {
  message?: string;
  code?: string | number;
  status?: number;
  name?: string;
  cause?: unknown;
}

// Metric keys used in charts and calculations
export type MetricKey = 'views' | 'likes' | 'comments' | 'shares';

// Metric info for styling and display
export interface MetricInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

// Growth calculation result
export interface GrowthResult {
  value: number;
  isPositive: boolean;
}

// Daily data point for charts (extends from analytics types)
export interface DailyDataPoint {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  [key: string]: number | string; // Allow indexing by string
}

// Video metrics for public display
export interface PublicVideoMetric {
  id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  engagementRate: string;
  videoInfo: {
    id: string;
    videoUrl: string;
    videoName: string;
    videoType: string;
    createdAt: number;
    tiktokUrl: string | null;
    campaign: {
      id: string;
      campaignName: string;
    };
  };
}

// Campaign info for public display
export interface PublicCampaignInfo {
  id: string;
  campaignName: string;
  artistName: string;
  songName: string;
  genre: string;
  campaignCoverImageUrl: string;
}

// Totals for metrics (extends from analytics types)
export interface MetricTotals extends Totals {
  totalVideos: number;
}

// Main shared report data structure
export interface SharedReportData {
  reportName: string;
  reportCreatedAt: number; // Unix timestamp from backend
  dailyData: DailyDataPoint[];
  totals: MetricTotals;
  avgEngagementRate: string;
  videoMetrics: PublicVideoMetric[];
  campaigns: PublicCampaignInfo[];
  hiddenVideoIds: string[];
  lastUpdatedAt?: number; // Unix timestamp from backend
}

// Props for components
export interface PublicReportContentProps {
  shareId: string;
}

export interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export interface ReportHeaderProps {
  reportName: string;
  reportCreatedAt: Date;
}

export interface LoadingStateProps {
  isRefetching?: boolean;
}

export interface ErrorStateProps {
  error: PublicReportError | null;
  onRetry: () => void;
  retryCount: number;
}

export interface EmptyStateProps {
  onBack: () => void;
}