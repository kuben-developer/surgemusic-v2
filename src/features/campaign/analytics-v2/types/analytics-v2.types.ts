export interface ViewsFilter {
  minViews?: number;
  maxViews?: number;
  isManualOnly?: boolean;
}

export type SortOrder = "asc" | "desc";

export type MetricType = "views" | "likes" | "comments" | "shares";

export type PlatformFilter = "all" | "tiktok" | "instagram";

export interface AdjustedTotals {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}

export interface CampaignSettings {
  minViewsFilter: number;
  currencySymbol: "USD" | "GBP";
  manualCpmMultiplier: number;
  apiCpmMultiplier: number;
}

export interface SnapshotPoint {
  snapshotAt: number;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}

export interface ChartDataPoint {
  label: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  isLive?: boolean;
}

export interface VideoPerformanceRow {
  _id: string;
  tiktokVideoId: string;
  tiktokAuthorId: string;
  mediaUrl: string;
  postedAt: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  isManual: boolean;
  platform?: "tiktok" | "instagram";
  thumbnailUrl?: string | null;
}

export interface DailySnapshot {
  postDate: string;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}
