// Main page component
export { AnalyticsV2Page } from "./AnalyticsV2Page";

// Components
export { AnalyticsV2Client } from "./components/AnalyticsV2Client";
export { KPIMetricsV2 } from "./components/KPIMetricsV2";
export { MetricsChartV2 } from "./components/MetricsChartV2";
export { VideoPerformanceTableV2 } from "./components/VideoPerformanceTableV2";
export { AnalyticsV2Header } from "./components/AnalyticsV2Header";

// Hooks
export { useCampaignAnalyticsV2 } from "./hooks/useCampaignAnalyticsV2";
export { useChartDataV2 } from "./hooks/useChartDataV2";
export { useVideoPerformanceV2 } from "./hooks/useVideoPerformanceV2";
export { useCounterAnimation } from "./hooks/useCounterAnimation";

// Types
export type {
  AdjustedTotals,
  CampaignSettings,
  ChartDataPoint,
  MetricType,
  VideoPerformanceRow,
  ViewsFilter,
  SortOrder,
} from "./types/analytics-v2.types";
