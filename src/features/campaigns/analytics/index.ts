// Page export for app router
export { default as CampaignAnalyticsPage } from './CampaignAnalyticsPage';

// Components
export { default as AnalyticsClient } from './components/AnalyticsClient';
export { KPIMetrics } from './components/KPIMetrics';
export { MetricsChart } from './components/MetricsChart';
export { VideoPerformanceTable } from './components/VideoPerformanceTable';

// Hooks
export { useAnalyticsData } from './hooks/useAnalyticsData';

// Types
export type { AnalyticsData, DailyMetric, VideoMetric, GrowthMetric, MetricInfo } from './types/analytics.types';