// Page export for app router
export { default as CampaignAnalyticsPage } from './CampaignAnalyticsPage';

// Components
export { default as AnalyticsClient } from './components/AnalyticsClient';
export { KPIMetrics } from './components/KPIMetrics';
export { MetricsChart } from './components/MetricsChart';
export { VideoPerformanceTable } from './components/VideoPerformanceTable';
export { AnalyticsHeader } from './components/AnalyticsHeader';
export { CampaignInfoSection } from './components/CampaignInfoSection';

// Hooks
export { useAnalyticsData } from './hooks/useAnalyticsData';

// Utils
export { 
  calculateMetricGrowth,
  calculateGrowthMetrics, 
  calculateEngagementGrowth, 
  processAnalyticsData,
  calculateAllGrowthMetrics
} from './utils/analytics-calculations';

// Types
export type { AnalyticsData, DailyMetric, VideoMetric, GrowthMetric, MetricInfo } from './types/analytics.types';