// Main page component
export { CampaignAnalyticsPage } from './CampaignAnalyticsPage';

// Components
export { AnalyticsClient } from './components/AnalyticsClient';
export { KPIMetrics } from './components/KPIMetrics';
export { MetricsChart } from './components/MetricsChart';
export { VideoPerformanceTable } from './components/VideoPerformanceTable';
export { AnalyticsHeader } from './components/AnalyticsHeader';
export { CampaignInfoSection } from './components/CampaignInfoSection';

// Hooks
export { useCampaignAnalytics } from './hooks/useCampaignAnalytics';

// Types
export type {
  CampaignAnalyticsData,
  DateFilter,
  MetricType,
} from './types/analytics.types';
