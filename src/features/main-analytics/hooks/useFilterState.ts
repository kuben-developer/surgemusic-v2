"use client";

import { useState } from 'react';
import { DEFAULT_DATE_RANGE } from '../constants/filters.constants';

interface UseFilterStateReturn {
  // Campaign filters
  selectedCampaigns: string[];
  handleCampaignChange: (campaignId: string, isChecked: boolean) => void;
  handleResetCampaigns: () => void;
  
  // Date range filter
  dateRange: string;
  handleDateRangeChange: (value: string) => void;
}

/**
 * Hook for managing campaign and date range filter state
 * Separated from pagination and metric selection for better focus
 */
export function useFilterState(): UseFilterStateReturn {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);

  const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
    setSelectedCampaigns(prev => 
      isChecked
        ? [...prev, campaignId]
        : prev.filter(id => id !== campaignId)
    );
  };

  const handleResetCampaigns = () => {
    setSelectedCampaigns([]);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  return {
    selectedCampaigns,
    handleCampaignChange,
    handleResetCampaigns,
    dateRange,
    handleDateRangeChange,
  };
}