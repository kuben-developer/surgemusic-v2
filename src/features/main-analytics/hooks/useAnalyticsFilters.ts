"use client"

import { useState } from 'react';
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

export function useAnalyticsFilters(): UseAnalyticsFiltersReturn {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("30");
  const [activeMetric, setActiveMetric] = useState<MetricKey>('views');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
    setSelectedCampaigns(prev => {
      const newSelection = isChecked
        ? [...prev, campaignId]
        : prev.filter(id => id !== campaignId);
      setCurrentPage(0); // Reset pagination when filter changes
      return newSelection;
    });
  };

  const handleResetCampaigns = () => {
    setSelectedCampaigns([]);
    setCurrentPage(0);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    setCurrentPage(0); // Reset pagination when filter changes
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