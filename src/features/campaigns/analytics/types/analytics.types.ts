export interface AnalyticsData {
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  dailyData: DailyMetric[];
  avgEngagementRate: string;
  lastUpdatedAt?: string;
  videoMetrics: VideoMetric[];
}

export interface DailyMetric {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface VideoMetric {
  id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface GrowthMetric {
  value: number;
  isPositive: boolean;
}

export interface MetricInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}