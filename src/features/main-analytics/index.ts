// Page export for app router
export { AnalyticsPage } from './AnalyticsPage';

// Components
export { AnalyticsContent } from './components/AnalyticsContent';
export { AnalyticsGrid } from './components/AnalyticsGrid';
export { LoadingStates } from './components/LoadingStates';
export { ErrorStates } from './components/ErrorStates';

// Hooks
export { useAnalyticsData } from './hooks/useAnalyticsData';
export { useAnalyticsFilters } from './hooks/useAnalyticsFilters';
export { useAnalyticsRefresh } from './hooks/useAnalyticsRefresh';
export { useAnalyticsTransform } from './hooks/useAnalyticsTransform';
export { useMetricCalculations } from './hooks/useMetricCalculations';

// Types used by other features
export type { AnalyticsData, Campaign } from './types/analytics.types';

// Constants
export { metricInfo, fadeInUp, staggerContainer } from './constants/metrics.constants';

// Utilities used by multiple features
export { calculateGrowth } from './utils/analytics.utils';