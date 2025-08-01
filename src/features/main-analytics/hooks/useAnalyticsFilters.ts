"use client"

import { useState } from 'react';
import type { MetricKey } from '@/components/analytics/types';
import { 
  DEFAULT_DATE_RANGE,
  DEFAULT_ACTIVE_METRIC,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE
} from '../constants/filters.constants';

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

export function useAnalyticsFilters(): UseAnalyticsFiltersReturn {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);
  const [activeMetric, setActiveMetric] = useState<MetricKey>(DEFAULT_ACTIVE_METRIC);
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Helper function to reset pagination - used when filters change
  const resetPagination = () => setCurrentPage(DEFAULT_CURRENT_PAGE);

  const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
    setSelectedCampaigns(prev => {
      const newSelection = isChecked
        ? [...prev, campaignId]
        : prev.filter(id => id !== campaignId);
      resetPagination();
      return newSelection;
    });
  };

  const handleResetCampaigns = () => {
    setSelectedCampaigns([]);
    resetPagination();
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    resetPagination();
  };

  return {
    selectedCampaigns,
    handleCampaignChange,
    handleResetCampaigns,
    dateRange,
    handleDateRangeChange,
    activeMetric,
    setActiveMetric,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  };
}