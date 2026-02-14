// Main page components
export { AnalyticsV2Page } from "./AnalyticsV2Page";
export { AdvancedAnalyticsPage } from "./AdvancedAnalyticsPage";

// Components
export { AnalyticsV2Client } from "./components/AnalyticsV2Client";
export { KPIMetricsV2 } from "./components/KPIMetricsV2";
export { MetricsChartV2 } from "./components/MetricsChartV2";
export { VideoPerformanceTableV2 } from "./components/VideoPerformanceTableV2";
export { AnalyticsV2Header } from "./components/AnalyticsV2Header";

// Advanced Analytics
export { AdvancedAnalyticsSection } from "./components/AdvancedAnalyticsSection";
export { DimensionStatsTable } from "./components/DimensionStatsTable";

// Hooks
export { useCampaignAnalyticsV2 } from "./hooks/useCampaignAnalyticsV2";
export { useAdvancedAnalyticsV2 } from "./hooks/useAdvancedAnalyticsV2";
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
