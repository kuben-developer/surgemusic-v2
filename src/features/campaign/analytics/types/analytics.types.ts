export interface VideoMetric {
  postId: string;
  videoId: string;
  videoUrl: string;
  mediaUrl?: string;
  postedAt: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  isManual?: boolean;
}

export interface ViewsFilter {
  minViews?: number;
  maxViews?: number;
  isManualOnly?: boolean;
}

export type SortOrder = "asc" | "desc";

export interface PaginatedVideosResponse {
  videos: VideoMetric[];
  totalCount: number;
  hasMore: boolean;
}

export interface CampaignAnalyticsData {
  campaignId: string;
  totals: {
    posts: number;
    manualPosts: number;
    apiPosts: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  dailyData: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
  lastUpdatedAt: number;
  campaignMetadata: {
    campaignId: string;
    name: string;
    artist: string;
    song: string;
  };
}

export interface DateFilter {
  startDate: Date;
  endDate: Date;
}

export type MetricType = 'views' | 'likes' | 'comments' | 'shares';
