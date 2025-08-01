'use client';

import { useMemo } from 'react';
import type { SharedReportData } from '../types';
import type { VideoMetric } from '@/types/analytics.types';
import { useMetricCalculations as useSharedMetricCalculations } from '@/hooks/analytics';
import { normalizeVideoMetrics } from '@/utils/analytics';

/**
 * Public reports specific metric calculations hook
 * Uses shared hook but adds public reports specific data transformations
 */
export const useMetricCalculations = (data: SharedReportData | null) => {
  // Transform the data format for the shared hook
  const transformedData = useMemo(() => {
    if (!data) return { dailyData: [], videoMetrics: [], hiddenVideoIds: [] };
    
    return {
      dailyData: data.dailyData || [],
      videoMetrics: data.videoMetrics ? normalizeVideoMetrics(data.videoMetrics) : [],
      hiddenVideoIds: data.hiddenVideoIds || []
    };
  }, [data]);

  // Use the shared hook
  const sharedCalculations = useSharedMetricCalculations(transformedData);

  // Additional calculations specific to public reports
  const campaignCount = data?.campaigns?.length || 0;
  const totals = data?.totals;
  const totalVideos = data?.totals?.totalVideos;

  return {
    ...sharedCalculations,
    campaignCount,
    totals,
    totalVideos
  };
};