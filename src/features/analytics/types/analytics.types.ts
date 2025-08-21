// Core Analytics Types for the new simplified structure

export interface AnalyticsMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posts: number;
  engagementRate: number; // Decimal value, not percentage
}

export interface DailyMetric {
  date: string; // ISO format YYYY-MM-DD
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posts: number;
}

export interface VideoMetric {
  videoId: string;
  campaignId: string;
  campaignName: string;
  platform: "tiktok" | "instagram" | "youtube";
  thumbnailUrl: string;
  videoUrl: string;
  postedAt: number;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  videoCount: number;
  status: string;
}

export interface AnalyticsMetadata {
  lastUpdatedAt: number;
  dateRange: {
    start: string; // ISO format
    end: string;   // ISO format
  };
  totalVideos: number;
  reportId?: string;
  hiddenVideoIds?: string[];
}

export interface AnalyticsResponse {
  metrics: AnalyticsMetrics;
  dailyMetrics: DailyMetric[];
  videoMetrics: VideoMetric[];
  campaigns: Campaign[];
  metadata: AnalyticsMetadata;
}

// Comments Types
export interface Comment {
  commentId: string;
  text: string;
  authorUsername: string;
  authorNickname: string;
  authorProfilePicUrl: string;
  createdAt: number;
}

export interface CommentWithVideo {
  id: string;
  videoId: string;
  campaignId: string;
  campaignName: string;
  videoUrl: string;
  thumbnailUrl: string;
  platform: "tiktok" | "instagram" | "youtube";
  comment: Comment;
}

export interface CommentsResponse {
  comments: CommentWithVideo[];
  metadata: {
    totalComments: number;
    lastUpdatedAt: number;
  };
}

// Growth Metrics
export interface GrowthData {
  value: number;
  isPositive: boolean;
}

export interface GrowthMetrics {
  views: GrowthData;
  likes: GrowthData;
  comments: GrowthData;
  shares: GrowthData;
  engagement: GrowthData;
}

// Hook Options
export interface UseAnalyticsOptions {
  type: 'campaign' | 'main' | 'report';
  entityId?: string; // Campaign or Report ID
  selectedCampaigns?: string[];
  initialDateRange?: number; // Default 30 days
}

export interface UseCommentsOptions {
  campaignIds?: string[];
  pageSize?: number;
}

// Component Props
export interface AnalyticsContainerProps {
  type: 'campaign' | 'main' | 'report';
  entityId?: string;
  title?: string;
  showCampaignSelector?: boolean;
  showCommentsSection?: boolean;
  showExportButton?: boolean;
}

// Metric Types for UI
export type MetricKey = 'views' | 'likes' | 'comments' | 'shares';

export interface MetricInfo {
  label: string;
  value: number;
  growth?: GrowthData;
  icon?: React.ReactNode;
  color?: string;
}