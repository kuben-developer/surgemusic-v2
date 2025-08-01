"use client";

import { useFilterState } from './useFilterState';
import { usePagination } from './usePagination';
import { useMetricSelection } from './useMetricSelection';

/**
 * Compound hook that combines all analytics state management
 * Handles coordination between different state concerns
 */
export function useAnalyticsState() {
  const filterState = useFilterState();
  const pagination = usePagination();
  const metricSelection = useMetricSelection();

  // Enhanced handlers that coordinate between state slices
  const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
    filterState.handleCampaignChange(campaignId, isChecked);
    pagination.resetPagination(); // Reset pagination when filters change
  };

  const handleResetCampaigns = () => {
    filterState.handleResetCampaigns();
    pagination.resetPagination(); // Reset pagination when filters change
  };

  const handleDateRangeChange = (value: string) => {
    filterState.handleDateRangeChange(value);
    pagination.resetPagination(); // Reset pagination when filters change
  };

  return {
    // Filter state
    selectedCampaigns: filterState.selectedCampaigns,
    handleCampaignChange,
    handleResetCampaigns,
    dateRange: filterState.dateRange,
    handleDateRangeChange,
    
    // Pagination state
    currentPage: pagination.currentPage,
    setCurrentPage: pagination.setCurrentPage,
    itemsPerPage: pagination.itemsPerPage,
    setItemsPerPage: pagination.setItemsPerPage,
    
    // Metric selection state
    activeMetric: metricSelection.activeMetric,
    setActiveMetric: metricSelection.setActiveMetric,
  };
}