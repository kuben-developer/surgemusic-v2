import type { MetricKey } from '@/components/analytics/types';

/**
 * Default values for analytics filters
 * Centralized configuration for consistent defaults across the feature
 */

export const DEFAULT_DATE_RANGE = "30";
export const DEFAULT_ACTIVE_METRIC: MetricKey = "views";
export const DEFAULT_CURRENT_PAGE = 0;
export const DEFAULT_ITEMS_PER_PAGE = 5;

/**
 * Available date range options for analytics
 */
export const DATE_RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last year" }
] as const;

/**
 * Available items per page options
 */
export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;