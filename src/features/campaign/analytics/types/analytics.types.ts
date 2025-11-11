export interface CampaignAnalyticsData {
  campaignId: string;
  totals: {
    posts: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
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

export interface DateFilter {
  startDate: Date;
  endDate: Date;
}

export type MetricType = 'views' | 'likes' | 'comments' | 'shares' | 'saves';
