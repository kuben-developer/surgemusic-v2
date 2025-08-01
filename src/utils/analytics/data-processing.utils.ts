import type { 
  AnalyticsData, 
  BaseAnalyticsData, 
  ProcessedAnalyticsData, 
  VideoMetric, 
  DailyData, 
  Totals 
} from '@/types/analytics.types';

/**
 * Process raw analytics data into a standardized format
 * Used across multiple features for data normalization
 */
export const processAnalyticsData = (analyticsData: any): BaseAnalyticsData => {
  if (!analyticsData) {
    return {
      totals: { views: 0, likes: 0, comments: 0, shares: 0 },
      dailyData: [],
      avgEngagementRate: '0',
      lastUpdatedAt: null,
      videoMetrics: []
    };
  }

  return {
    totals: analyticsData.totals || { views: 0, likes: 0, comments: 0, shares: 0 },
    dailyData: analyticsData.dailyData || [],
    avgEngagementRate: analyticsData.avgEngagementRate || '0',
    lastUpdatedAt: analyticsData.lastUpdatedAt,
    videoMetrics: analyticsData.videoMetrics || []
  };
};

/**
 * Process analytics data with hidden video filtering
 * Used specifically by reports feature
 */
export const processAnalyticsDataWithFiltering = (analyticsData: any): ProcessedAnalyticsData => {
  const { 
    dailyData = [], 
    avgEngagementRate = "0", 
    videoMetrics = [], 
    hiddenVideoIds = [], 
    lastUpdatedAt, 
    totals = { views: 0, likes: 0, comments: 0, shares: 0 } 
  } = analyticsData ?? {};
  
  return {
    dailyData,
    avgEngagementRate,
    videoMetrics,
    hiddenVideoIds,
    lastUpdatedAt,
    totals,
    allVideoMetrics: [...videoMetrics],
    visibleVideoMetrics: filterVisibleVideos(videoMetrics, hiddenVideoIds),
  };
};

/**
 * Filter video metrics to exclude hidden videos
 * Used by reports and public reports features
 */
export const filterVisibleVideos = (videoMetrics: VideoMetric[], hiddenVideoIds: string[]): VideoMetric[] => {
  return videoMetrics.filter(
    (vm: VideoMetric) => !hiddenVideoIds.includes(vm.videoInfo?.id || vm.id)
  );
};

/**
 * Calculate total engagement rate from daily data
 * Used across multiple features
 */
export const calculateEngagementRate = (dailyData: DailyData[]): string => {
  if (!dailyData || dailyData.length === 0) return '0';

  const totalViews = dailyData.reduce((sum, day) => sum + day.views, 0);
  const totalEngagements = dailyData.reduce((sum, day) => 
    sum + day.likes + day.comments + day.shares, 0
  );

  if (totalViews === 0) return '0';

  const rate = (totalEngagements / totalViews) * 100;
  return rate.toFixed(2);
};

/**
 * Transform video metrics for display consistency
 * Used by public reports feature for data normalization
 */
export const normalizeVideoMetrics = (videoMetrics: any[]): VideoMetric[] => {
  return videoMetrics.map(vm => ({
    id: vm.id,
    views: vm.views,
    likes: vm.likes,
    comments: vm.comments,
    shares: vm.shares,
    engagementRate: vm.engagementRate,
    videoInfo: {
      id: vm.videoInfo.id,
      postId: vm.videoInfo.postId || null,
      videoUrl: vm.videoInfo.videoUrl,
      videoName: vm.videoInfo.videoName,
      videoType: vm.videoInfo.videoType,
      tiktokUrl: vm.videoInfo.tiktokUrl || '',
      createdAt: new Date(vm.videoInfo.createdAt),
      campaign: {
        id: parseInt(vm.videoInfo.campaign.id),
        campaignName: vm.videoInfo.campaign.campaignName
      }
    }
  }));
};

/**
 * Validate analytics data structure
 * Ensures data integrity across features
 */
export const validateAnalyticsData = (data: any): boolean => {
  if (!data) return false;
  
  // Check required properties
  const hasRequiredProps = typeof data === 'object' && 
    Array.isArray(data.dailyData) &&
    typeof data.totals === 'object' &&
    Array.isArray(data.videoMetrics);

  if (!hasRequiredProps) return false;

  // Validate totals structure
  const totalsValid = data.totals &&
    typeof data.totals.views === 'number' &&
    typeof data.totals.likes === 'number' &&
    typeof data.totals.comments === 'number' &&
    typeof data.totals.shares === 'number';

  return totalsValid;
};

/**
 * Create default analytics data structure
 * Used as fallback when no data is available
 */
export const createDefaultAnalyticsData = (): BaseAnalyticsData => ({
  totals: { views: 0, likes: 0, comments: 0, shares: 0 },
  dailyData: [],
  avgEngagementRate: '0',
  lastUpdatedAt: null,
  videoMetrics: []
});