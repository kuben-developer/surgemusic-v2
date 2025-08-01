"use client";

import { useState, useCallback } from 'react';
import { DEFAULT_DATE_RANGE } from '../constants/filters.constants';
import type { MetricKey } from '@/types/analytics.types';

export interface AnalyticsState {
  // Filter state
  selectedCampaigns: string[];
  dateRange: string;
  
  // Pagination state
  currentPage: number;
  itemsPerPage: number;
  
  // Metric selection state
  activeMetric: MetricKey;
}

export interface AnalyticsActions {
  // Filter actions
  handleCampaignChange: (campaignId: string, isChecked: boolean) => void;
  handleResetCampaigns: () => void;
  handleDateRangeChange: (value: string) => void;
  
  // Pagination actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  resetPagination: () => void;
  
  // Metric selection actions
  setActiveMetric: (metric: MetricKey) => void;
}

/**
 * Consolidated analytics state management hook
 * Combines filters, pagination, and metric selection with proper coordination
 */
export function useAnalyticsState(): AnalyticsState & AnalyticsActions {
  // Filter state
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);
  
  // Pagination state
  const [currentPage, setCurrentPageState] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Metric selection state
  const [activeMetric, setActiveMetric] = useState<MetricKey>('views');

  // Filter actions with pagination reset coordination
  const handleCampaignChange = useCallback((campaignId: string, isChecked: boolean) => {
    setSelectedCampaigns(prev => 
      isChecked
        ? [...prev, campaignId]
        : prev.filter(id => id !== campaignId)
    );
    setCurrentPageState(1); // Reset pagination when filters change
  }, []);

  const handleResetCampaigns = useCallback(() => {
    setSelectedCampaigns([]);
    setCurrentPageState(1); // Reset pagination when filters change
  }, []);

  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value);
    setCurrentPageState(1); // Reset pagination when filters change
  }, []);

  // Pagination actions
  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPageState(1);
  }, []);

  return {
    // State
    selectedCampaigns,
    dateRange,
    currentPage,
    itemsPerPage,
    activeMetric,
    
    // Actions
    handleCampaignChange,
    handleResetCampaigns,
    handleDateRangeChange,
    setCurrentPage,
    setItemsPerPage,
    resetPagination,
    setActiveMetric,
  };
}