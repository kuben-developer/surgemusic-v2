'use client';

import { useState, useMemo, useCallback } from 'react';
import type { DailyData, VideoMetric, Campaign, MetricKey } from '@/types/analytics.types';

interface UseAnalyticsFiltersProps {
  campaigns?: Campaign[];
  videoMetrics?: VideoMetric[];
  dailyData?: DailyData[];
}

interface UseAnalyticsFiltersReturn {
  // Filter states
  selectedCampaigns: string[];
  dateRange: string;
  activeMetric: MetricKey;
  searchTerm: string;
  
  // Filter actions
  setSelectedCampaigns: (campaigns: string[]) => void;
  setDateRange: (range: string) => void;
  setActiveMetric: (metric: MetricKey) => void;
  setSearchTerm: (term: string) => void;
  
  // Filtered data
  filteredVideoMetrics: VideoMetric[];
  filteredDailyData: DailyData[];
  
  // Utility functions
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Shared hook for managing analytics filters and data filtering
 * Provides consistent filtering logic across analytics features
 * 
 * Used by:
 * - Main analytics feature
 * - Campaign analytics feature
 * - Reports feature
 */
export function useAnalyticsFilters({
  campaigns = [],
  videoMetrics = [],
  dailyData = []
}: UseAnalyticsFiltersProps): UseAnalyticsFiltersReturn {
  
  // Filter states
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('all');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('views');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter video metrics based on selected campaigns and search term
  const filteredVideoMetrics = useMemo(() => {
    let filtered = videoMetrics;

    // Filter by selected campaigns
    if (selectedCampaigns.length > 0) {
      filtered = filtered.filter(vm => 
        vm.videoInfo?.campaign?.id && 
        selectedCampaigns.includes(vm.videoInfo.campaign.id.toString())
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vm => 
        vm.videoInfo?.videoName?.toLowerCase().includes(term) ||
        vm.videoInfo?.campaign?.campaignName?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [videoMetrics, selectedCampaigns, searchTerm]);

  // Filter daily data based on date range
  const filteredDailyData = useMemo(() => {
    if (dateRange === 'all') return dailyData;

    const now = new Date();
    const filterDate = new Date();

    switch (dateRange) {
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        return dailyData;
    }

    return dailyData.filter(day => new Date(day.date) >= filterDate);
  }, [dailyData, dateRange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCampaigns([]);
    setDateRange('all');
    setActiveMetric('views');
    setSearchTerm('');
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return selectedCampaigns.length > 0 || 
           dateRange !== 'all' || 
           searchTerm.trim() !== '';
  }, [selectedCampaigns, dateRange, searchTerm]);

  return {
    // Filter states
    selectedCampaigns,
    dateRange,
    activeMetric,
    searchTerm,
    
    // Filter actions
    setSelectedCampaigns,
    setDateRange,
    setActiveMetric,
    setSearchTerm,
    
    // Filtered data
    filteredVideoMetrics,
    filteredDailyData,
    
    // Utility functions
    clearAllFilters,
    hasActiveFilters
  };
}