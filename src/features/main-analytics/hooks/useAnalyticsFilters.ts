"use client";

import { useAnalyticsState } from './useAnalyticsState';
import type { MetricKey } from '@/components/analytics/types';

interface UseAnalyticsFiltersReturn {
  // Campaign filters
  selectedCampaigns: string[];
  handleCampaignChange: (campaignId: string, isChecked: boolean) => void;
  handleResetCampaigns: () => void;
  
  // Date range filter
  dateRange: string;
  handleDateRangeChange: (value: string) => void;
  
  // Metric selection
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
}

/**
 * Legacy hook that delegates to the new compound hook
 * Maintained for backward compatibility
 * @deprecated Use useAnalyticsState instead for new code
 */
export function useAnalyticsFilters(): UseAnalyticsFiltersReturn {
  return useAnalyticsState();
}