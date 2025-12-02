/**
 * Types for the Analytics Page feature
 */

/**
 * Sparkline data point for mini charts
 */
export interface SparklineDataPoint {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Campaign totals from analytics
 */
export interface CampaignTotals {
  posts: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

/**
 * Campaign with analytics data (from Convex query)
 */
export interface CampaignWithAnalytics {
  campaignId: string;
  campaignName: string;
  artist: string;
  song: string;
  totals: CampaignTotals;
  sparklineData: SparklineDataPoint[];
  lastUpdatedAt: number;
}

/**
 * Aggregate totals across all campaigns
 */
export interface AggregateTotals {
  campaigns: number;
  posts: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Sort configuration for the overview table
 */
export type SortField = "campaignName" | "views" | "likes" | "comments" | "shares" | "posts" | "cpm";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

/**
 * Props for overview view
 */
export interface OverviewViewProps {
  campaigns: CampaignWithAnalytics[];
  onSelectCampaign: (campaignId: string) => void;
  isLoading?: boolean;
}

/**
 * Props for overview KPI metrics
 */
export interface OverviewKPIMetricsProps {
  totals: AggregateTotals;
}

/**
 * Props for campaign overview table
 */
export interface CampaignOverviewTableProps {
  campaigns: CampaignWithAnalytics[];
  onSelectCampaign: (campaignId: string) => void;
}

/**
 * Props for campaign overview row
 */
export interface CampaignOverviewRowProps {
  campaign: CampaignWithAnalytics;
  onClick: () => void;
}

/**
 * Props for sparkline component
 */
export interface SparklineProps {
  data: SparklineDataPoint[];
  dataKey?: "views" | "likes" | "comments" | "shares";
  color?: string;
  height?: number;
  width?: number | string;
}

