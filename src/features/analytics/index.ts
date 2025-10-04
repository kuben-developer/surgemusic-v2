// Main Container Component
export { AnalyticsContainer } from './components/AnalyticsContainer';

// Individual Components (if needed for custom layouts)
export { AnalyticsHeader } from './components/AnalyticsHeader';
export { MetricsOverview } from './components/MetricsOverview';
export { MetricsChart } from './components/MetricsChart';
export { VideoMetricsTable } from './components/VideoMetricsTable';
export { CommentsSection } from './components/CommentsSection';
export { CampaignSelector } from './components/CampaignSelector';
export { LoadingState } from './components/LoadingState';
export { ErrorState } from './components/ErrorState';
export { AdvancedAnalyticsView } from './components/AdvancedAnalyticsView';

// Hooks
export { useAnalytics } from './hooks/useAnalytics';
export { useComments } from './hooks/useComments';

// Types
export type {
  AnalyticsResponse,
  AnalyticsMetrics,
  DailyMetric,
  VideoMetric,
  Campaign,
  Comment,
  CommentWithVideo,
  CommentsResponse,
  GrowthData,
  GrowthMetrics,
  MetricKey,
  UseAnalyticsOptions,
  UseCommentsOptions,
  AnalyticsContainerProps
} from './types/analytics.types';