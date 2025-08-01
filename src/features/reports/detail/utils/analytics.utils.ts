// Re-export shared utilities for backward compatibility
export { 
  calculateAllGrowthMetrics,
  calculateMetricGrowth,
  calculateEngagementGrowth,
  filterVisibleVideos,
  processAnalyticsDataWithFiltering,
  processAnalyticsDataWithFiltering as processAnalyticsData,
  calculateGrowth,
  calculateWeeklyGrowth,
  getDefaultGrowthMetrics
} from '@/utils/analytics';