// Main page component
export { CampaignV2AnalyticsPage } from './CampaignV2AnalyticsPage';

// Components
export { AnalyticsClient } from './components/AnalyticsClient';
export { KPIMetrics } from './components/KPIMetrics';
export { MetricsChart } from './components/MetricsChart';
export { VideoPerformanceTable } from './components/VideoPerformanceTable';
export { AnalyticsHeader } from './components/AnalyticsHeader';
export { CampaignInfoSection } from './components/CampaignInfoSection';

// Hooks
export { useCampaignV2Analytics } from './hooks/useCampaignV2Analytics';

// Types
export type {
  CampaignV2AnalyticsData,
  DateRange,
  MetricType,
} from './types/analytics.types';
