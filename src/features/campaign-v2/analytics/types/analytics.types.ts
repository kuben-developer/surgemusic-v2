export interface CampaignV2AnalyticsData {
  totals: {
    posts: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  growth: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  engagementRate: string;
  engagementGrowth: string;
  dailyData: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }>;
  videoMetrics: Array<{
    postId: string;
    videoId: string;
    videoUrl: string;
    mediaUrl?: string;
    postedAt: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }>;
  lastUpdatedAt: number;
  campaignMetadata: {
    campaignId: string;
    name: string;
    artist: string;
    song: string;
  };
}

export type DateRange = 7 | 30 | 90;

export type MetricType = 'views' | 'likes' | 'comments' | 'shares' | 'saves';
