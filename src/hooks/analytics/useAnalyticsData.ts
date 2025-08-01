'use client';

import { useMemo } from 'react';
import type { 
  BaseAnalyticsData, 
  ProcessedAnalyticsData,
  GrowthMetrics 
} from '@/types/analytics.types';
import { 
  processAnalyticsData, 
  processAnalyticsDataWithFiltering,
  validateAnalyticsData,
  createDefaultAnalyticsData
} from '@/utils/analytics';
import { useMetricCalculations } from './useMetricCalculations';

interface UseAnalyticsDataProps {
  rawData: any;
  includeHiddenFiltering?: boolean;
  useWeeklyGrowth?: boolean;
}

interface UseAnalyticsDataReturn {
  processedData: BaseAnalyticsData | ProcessedAnalyticsData;
  growthMetrics: GrowthMetrics;
  isDataValid: boolean;
  campaignCount: number;
  totalVideos: number;
}

/**
 * Shared hook for processing and validating analytics data
 * Provides consistent data processing across all analytics features
 * 
 * Used by:
 * - Main analytics feature
 * - Campaign analytics feature
 * - Reports feature  
 * - Public reports feature
 */
export function useAnalyticsData({
  rawData,
  includeHiddenFiltering = false,
  useWeeklyGrowth = false
}: UseAnalyticsDataProps): UseAnalyticsDataReturn {
  
  // Validate and process raw data
  const processedData = useMemo(() => {
    if (!validateAnalyticsData(rawData)) {
      return includeHiddenFiltering 
        ? {
            ...createDefaultAnalyticsData(),
            hiddenVideoIds: [],
            allVideoMetrics: [],
            visibleVideoMetrics: []
          } as ProcessedAnalyticsData
        : createDefaultAnalyticsData();
    }

    return includeHiddenFiltering 
      ? processAnalyticsDataWithFiltering(rawData)
      : processAnalyticsData(rawData);
  }, [rawData, includeHiddenFiltering]);

  // Calculate metrics using shared hook
  const { 
    viewsGrowth,
    likesGrowth, 
    commentsGrowth,
    sharesGrowth,
    engagementGrowth,
    campaignCount = 0,
    totalVideos = 0
  } = useMetricCalculations({
    dailyData: processedData.dailyData,
    videoMetrics: processedData.videoMetrics,
    hiddenVideoIds: 'hiddenVideoIds' in processedData ? (processedData.hiddenVideoIds || []) : [],
    useWeeklyCalculation: useWeeklyGrowth
  });

  const growthMetrics = useMemo(() => ({
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    sharesGrowth,
    engagementGrowth
  }), [viewsGrowth, likesGrowth, commentsGrowth, sharesGrowth, engagementGrowth]);

  const isDataValid = useMemo(() => validateAnalyticsData(rawData), [rawData]);

  return {
    processedData,
    growthMetrics,
    isDataValid,
    campaignCount,
    totalVideos
  };
}