// Re-export shared utilities for backward compatibility
export * from '@/utils/analytics';

// Specific exports for better tree-shaking and explicit imports
export {
  calculateMetricGrowth,
  calculateEngagementGrowth,
  processAnalyticsData,
  calculateAllGrowthMetrics,
  getDefaultGrowthMetrics,
  filterVisibleVideos,
  calculateGrowth,
  calculateWeeklyGrowth
} from '@/utils/analytics';