'use client';

import { useMemo } from 'react';
import type { 
  DailyData, 
  UseMetricCalculationsReturn, 
  VideoMetric,
  AnalyticsData 
} from '@/types/analytics.types';
import { 
  calculateAllGrowthMetrics, 
  getDefaultGrowthMetrics,
  filterVisibleVideos 
} from '@/utils/analytics';

interface UseMetricCalculationsProps {
  dailyData?: DailyData[];
  videoMetrics?: VideoMetric[];
  hiddenVideoIds?: string[];
  useWeeklyCalculation?: boolean;
}

/**
 * Shared hook for calculating metric growth values across features
 * Provides memoized calculations to prevent unnecessary recalculations
 * 
 * Used by:
 * - Main analytics feature
 * - Campaign analytics feature  
 * - Public reports feature
 * - Reports feature
 */
export function useMetricCalculations({
  dailyData = [],
  videoMetrics = [],
  hiddenVideoIds = [],
  useWeeklyCalculation = false
}: UseMetricCalculationsProps): UseMetricCalculationsReturn {
  
  // Calculate all growth metrics in a single useMemo
  const growthMetrics = useMemo(() => {
    if (!dailyData || dailyData.length === 0) {
      return getDefaultGrowthMetrics();
    }

    return calculateAllGrowthMetrics(dailyData, useWeeklyCalculation);
  }, [dailyData, useWeeklyCalculation]);

  // Calculate visible video metrics
  const visibleVideoMetrics = useMemo(() => {
    if (hiddenVideoIds.length === 0) return videoMetrics;
    return filterVisibleVideos(videoMetrics, hiddenVideoIds);
  }, [videoMetrics, hiddenVideoIds]);

  // Simple calculations that don't need separate useMemo
  const campaignCount = useMemo(() => {
    // Extract unique campaigns from video metrics
    const campaignIds = new Set(
      videoMetrics
        .map(vm => vm.videoInfo?.campaign?.id)
        .filter(Boolean)
    );
    return campaignIds.size;
  }, [videoMetrics]);

  const totalVideos = videoMetrics.length;

  return {
    ...growthMetrics,
    visibleVideoMetrics,
    campaignCount,
    totalVideos
  };
}