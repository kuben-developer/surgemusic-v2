import type { 
  GrowthMetrics, 
  GrowthData, 
  DailyData, 
  MetricKey,
  VideoMetric 
} from '@/types/analytics.types';
import { calculateGrowth, calculateWeeklyGrowth } from './growth-calculations.utils';

/**
 * Calculate all growth metrics at once
 * Used by multiple features for comprehensive growth analysis
 */
export const calculateAllGrowthMetrics = (
  dailyData: DailyData[], 
  useWeeklyCalculation = false
): GrowthMetrics => {
  if (useWeeklyCalculation) {
    // Cast to match expected type for weekly calculation
    const weeklyData = dailyData as Array<Record<string, number>>;
    return {
      viewsGrowth: calculateWeeklyGrowth(weeklyData, 'views'),
      likesGrowth: calculateWeeklyGrowth(weeklyData, 'likes'),
      commentsGrowth: calculateWeeklyGrowth(weeklyData, 'comments'),
      sharesGrowth: calculateWeeklyGrowth(weeklyData, 'shares'),
      engagementGrowth: calculateWeeklyGrowth(weeklyData, 'engagement'),
    };
  }

  return {
    viewsGrowth: calculateGrowth(dailyData, 'views'),
    likesGrowth: calculateGrowth(dailyData, 'likes'),
    commentsGrowth: calculateGrowth(dailyData, 'comments'),
    sharesGrowth: calculateGrowth(dailyData, 'shares'),
    engagementGrowth: calculateGrowth(dailyData, 'engagement'),
  };
};

/**
 * Get default growth metrics (all zeros)
 * Used as fallback when no data is available
 */
export const getDefaultGrowthMetrics = (): GrowthMetrics => {
  const defaultGrowth: GrowthData = { value: 0, isPositive: true };
  
  return {
    viewsGrowth: defaultGrowth,
    likesGrowth: defaultGrowth,
    commentsGrowth: defaultGrowth,
    sharesGrowth: defaultGrowth,
    engagementGrowth: defaultGrowth
  };
};

/**
 * Calculate engagement rate for a single video
 * Used for individual video metrics
 */
export const calculateVideoEngagementRate = (video: VideoMetric): string => {
  if (!video || video.views === 0) return '0.00';
  
  const engagements = video.likes + video.comments + video.shares;
  const rate = (engagements / video.views) * 100;
  
  return rate.toFixed(2);
};

/**
 * Calculate average engagement rate from multiple videos
 * Used for campaign and report analytics
 */
export const calculateAverageEngagementRate = (videos: VideoMetric[]): string => {
  if (!videos || videos.length === 0) return '0.00';
  
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const totalEngagements = videos.reduce((sum, video) => 
    sum + video.likes + video.comments + video.shares, 0
  );
  
  if (totalViews === 0) return '0.00';
  
  const rate = (totalEngagements / totalViews) * 100;
  return rate.toFixed(2);
};

/**
 * Get top performing videos by a specific metric
 * Used for analytics dashboards
 */
export const getTopVideos = (
  videos: VideoMetric[], 
  metric: MetricKey, 
  limit: number = 10
): VideoMetric[] => {
  return [...videos]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, limit);
};

/**
 * Calculate total metrics from daily data
 * Used for summary statistics
 */
export const calculateTotalMetrics = (dailyData: DailyData[]) => {
  return dailyData.reduce(
    (totals, day) => ({
      views: totals.views + day.views,
      likes: totals.likes + day.likes,
      comments: totals.comments + day.comments,
      shares: totals.shares + day.shares,
    }),
    { views: 0, likes: 0, comments: 0, shares: 0 }
  );
};

/**
 * Calculate metric distribution percentages
 * Used for analytics insights
 */
export const calculateMetricDistribution = (videos: VideoMetric[]) => {
  const totals = videos.reduce(
    (acc, video) => ({
      views: acc.views + video.views,
      likes: acc.likes + video.likes,
      comments: acc.comments + video.comments,
      shares: acc.shares + video.shares,
    }),
    { views: 0, likes: 0, comments: 0, shares: 0 }
  );

  const totalEngagements = totals.likes + totals.comments + totals.shares;

  return {
    likes: totalEngagements > 0 ? ((totals.likes / totalEngagements) * 100).toFixed(1) : '0',
    comments: totalEngagements > 0 ? ((totals.comments / totalEngagements) * 100).toFixed(1) : '0',
    shares: totalEngagements > 0 ? ((totals.shares / totalEngagements) * 100).toFixed(1) : '0',
  };
};