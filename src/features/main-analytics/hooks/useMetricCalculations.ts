import { useMemo } from 'react';
import { calculateGrowth } from '../utils/analytics.utils';
import type { DailyData } from '@/components/analytics/types';

interface UseMetricCalculationsReturn {
  viewsGrowth: { value: number; isPositive: boolean };
  likesGrowth: { value: number; isPositive: boolean };
  commentsGrowth: { value: number; isPositive: boolean };
  sharesGrowth: { value: number; isPositive: boolean };
  engagementGrowth: { value: number; isPositive: boolean };
}

/**
 * Custom hook for calculating metric growth values
 * Memoizes calculations to prevent unnecessary recalculations
 */
export function useMetricCalculations(dailyData: DailyData[]): UseMetricCalculationsReturn {
  return useMemo(() => {
    if (!dailyData || dailyData.length === 0) {
      const defaultGrowth = { value: 0, isPositive: true };
      return {
        viewsGrowth: defaultGrowth,
        likesGrowth: defaultGrowth,
        commentsGrowth: defaultGrowth,
        sharesGrowth: defaultGrowth,
        engagementGrowth: defaultGrowth
      };
    }

    return {
      viewsGrowth: calculateGrowth(dailyData, 'views'),
      likesGrowth: calculateGrowth(dailyData, 'likes'),
      commentsGrowth: calculateGrowth(dailyData, 'comments'),
      sharesGrowth: calculateGrowth(dailyData, 'shares'),
      engagementGrowth: calculateGrowth(dailyData, 'engagement')
    };
  }, [dailyData]);
}