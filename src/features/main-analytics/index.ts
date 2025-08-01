// Page export for app router
export { AnalyticsPage } from './AnalyticsPage';

// Components
export { AnalyticsContent } from './components/AnalyticsContent';
export { AnalyticsGrid } from './components/AnalyticsGrid';
export { LoadingStates } from './components/LoadingStates';
export { ErrorStates } from './components/ErrorStates';

// Section Components (for reuse in other features)
export { KpiSection } from './components/sections/KpiSection';
export { ChartsSection } from './components/sections/ChartsSection';
export { CommentsSection } from './components/sections/CommentsSection';

// Hooks - State Management
export { useAnalyticsState } from './hooks/useAnalyticsState';
export { useAnalyticsFilters } from './hooks/useAnalyticsFilters'; // Legacy - use useAnalyticsState instead
export { useFilterState } from './hooks/useFilterState';
export { usePagination } from './hooks/usePagination';
export { useMetricSelection } from './hooks/useMetricSelection';

// Hooks - Data & Calculations
export { useAnalyticsData } from './hooks/useAnalyticsData';
export { useAnalyticsRefresh } from './hooks/useAnalyticsRefresh';
export { useAnalyticsTransform } from './hooks/useAnalyticsTransform';
export { useMetricCalculations } from './hooks/useMetricCalculations';
export { useCampaignData } from './hooks/useCampaignData';

// Types used by other features
export type { 
  AnalyticsData, 
  Campaign,
  GrowthMetrics,
  BaseAnalyticsProps,
  ChartDataProps,
  PaginationProps,
  CampaignFilterProps,
  TopContentProps
} from './types/analytics.types';

// Constants
export { metricInfo, fadeInUp, staggerContainer } from './constants/metrics.constants';
export { 
  DEFAULT_DATE_RANGE,
  DEFAULT_ACTIVE_METRIC,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
  DATE_RANGE_OPTIONS,
  ITEMS_PER_PAGE_OPTIONS
} from './constants/filters.constants';

// Utilities used by multiple features
export { calculateGrowth } from './utils/analytics.utils';
export { 
  transformVideoMetrics, 
  createDefaultTotals, 
  createDefaultTransformResult 
} from './utils/transform.utils';