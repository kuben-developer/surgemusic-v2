import { useMemo } from 'react';
import type { VideoMetric, DailyData, Totals, AnalyticsData, Campaign } from '@/types/analytics.types';
import { 
  transformVideoMetrics, 
  createDefaultTotals, 
  createDefaultTransformResult 
} from '../utils/transform.utils';

interface UseAnalyticsTransformReturn {
  mappedVideoMetrics: VideoMetric[];
  campaignCount: number;
  totalVideos: number;
  totals: Totals & { totalVideos: number };
  dailyData: DailyData[];
  avgEngagementRate: string;
  campaigns: Campaign[];
}

/**
 * Custom hook for transforming raw analytics data into a format
 * suitable for UI components
 */
export function useAnalyticsTransform(data: AnalyticsData | null): UseAnalyticsTransformReturn {
  return useMemo(() => {
    // Return default values when no data is available
    if (!data) {
      return createDefaultTransformResult();
    }

    // Destructure data with fallback values
    const { 
      dailyData = [], 
      avgEngagementRate = "0", 
      campaigns = [], 
      videoMetrics = [], 
      totals = createDefaultTotals()
    } = data;
    
    // Transform video metrics using utility function
    const mappedVideoMetrics = transformVideoMetrics(videoMetrics);

    // Calculate derived values
    const campaignCount = campaigns.length;
    const totalVideos = totals.totalVideos;

    return {
      mappedVideoMetrics,
      campaignCount,
      totalVideos,
      totals,
      dailyData,
      avgEngagementRate,
      campaigns
    };
  }, [data]);
}