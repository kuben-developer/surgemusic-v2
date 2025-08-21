import React from "react";

// Core metric types
export type MetricKey = 'views' | 'likes' | 'comments' | 'shares';

// Growth data structure
export interface GrowthData {
  value: number;
  isPositive: boolean;
}

// Growth result (alias for consistency across features)
export type GrowthResult = GrowthData;

// Daily analytics data structure
export interface DailyData {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement?: number;
  [key: string]: number | string | undefined; // Allow flexible indexing
}

// Totals structure
export interface Totals {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  totalVideos?: number; // Optional for backward compatibility
  [key: string]: number | undefined; // Allow flexible indexing
}

// Video metric information
export interface VideoMetric {
  id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: string; // Required for display
  videoInfo: {  // Required for display
    id: string;
    postId: string | null;
    videoUrl: string;
    thumbnailUrl: string; // Add thumbnail URL
    videoName: string;
    videoType: string;
    tiktokUrl: string;
    createdAt: Date;
    campaign: {
      id: number;
      campaignName: string;
    };
  };
}

// Metric information for UI display
export interface MetricInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

// Campaign data structure
export interface Campaign {
  id: string;
  _id?: string; // For Convex compatibility
  campaignName: string;
  songName?: string;
  artistName?: string;
  campaignCoverImageUrl?: string | null;
  videoCount?: number;
  genre?: string;
  themes?: string[];
  isCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
}

// Base analytics data structure
export interface BaseAnalyticsData {
  dailyData: DailyData[];
  totals: Totals;
  avgEngagementRate: string;
  videoMetrics: VideoMetric[];
  lastUpdatedAt: string | null;
}

// Extended analytics data with campaigns
export interface AnalyticsData extends BaseAnalyticsData {
  campaigns?: Campaign[];
  hiddenVideoIds?: string[];
}

// Growth metrics collection
export interface GrowthMetrics {
  viewsGrowth: GrowthData;
  likesGrowth: GrowthData;
  commentsGrowth: GrowthData;
  sharesGrowth: GrowthData;
  engagementGrowth: GrowthData;
}

// Props interfaces for components
export interface BaseAnalyticsProps {
  campaignCount: number;
  totalVideos: number;
  totals: Totals & { totalVideos: number };
  avgEngagementRate: string;
}

export interface ChartDataProps {
  dailyData: DailyData[];
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
  campaigns: Campaign[];
}

export interface TopContentProps extends PaginationProps {
  videoMetrics: VideoMetric[];
}

// Hook return types
export interface UseMetricCalculationsReturn extends GrowthMetrics {
  visibleVideoMetrics?: VideoMetric[];
  campaignCount?: number;
  totals?: Totals;
  totalVideos?: number;
}

// Data processing result
export interface ProcessedAnalyticsData {
  dailyData: DailyData[];
  avgEngagementRate: string;
  videoMetrics: VideoMetric[];
  hiddenVideoIds: string[];
  lastUpdatedAt: string | null;
  totals: Totals;
  allVideoMetrics?: VideoMetric[];
  visibleVideoMetrics?: VideoMetric[];
}