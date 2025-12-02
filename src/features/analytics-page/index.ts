// Main Page Component
export { AnalyticsPage } from "./AnalyticsPage";

// Components
export { AnalyticsPageLayout } from "./components/AnalyticsPageLayout";
export { OverviewView } from "./components/OverviewView";
export { OverviewKPIMetrics } from "./components/OverviewKPIMetrics";
export { CampaignOverviewTable } from "./components/CampaignOverviewTable";
export { CampaignDetailView } from "./components/CampaignDetailView";
export { Sparkline } from "./components/Sparkline";

// Hooks
export { useSelectedCampaign } from "./hooks/useSelectedCampaign";
export { useAllCampaignsAnalytics } from "./hooks/useAllCampaignsAnalytics";

// Types
export type {
  CampaignWithAnalytics,
  CampaignTotals,
  AggregateTotals,
  SparklineDataPoint,
  SortConfig,
  SortField,
  SortDirection,
  OverviewViewProps,
  OverviewKPIMetricsProps,
  CampaignOverviewTableProps,
  SparklineProps,
} from "./types/analytics-page.types";

// Constants
export {
  OVERVIEW_KPI_METRICS,
  SPARKLINE_COLORS,
  DEFAULT_SPARKLINE_COLOR,
  fadeInUp,
  staggerContainer,
} from "./constants/analytics-page.constants";
