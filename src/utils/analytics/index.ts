// Barrel exports for analytics utilities
export * from './growth-calculations.utils';
export * from './data-processing.utils';
export * from './metric-calculations.utils';

// Import types needed for enhanced functions
import type { DailyData, GrowthData } from '@/types/analytics.types';
import { 
  calculateMetricGrowth as _calculateMetricGrowthNumber,
  calculateEngagementGrowth as _calculateEngagementGrowthNumber 
} from './growth-calculations.utils';

/**
 * Enhanced version of calculateMetricGrowth that returns GrowthData instead of number
 * This addresses compatibility issues where some features expect GrowthData objects
 */
export const calculateMetricGrowth = (dailyData: DailyData[], metric: string): GrowthData => {
  const value = _calculateMetricGrowthNumber(dailyData, metric);
  return {
    value: Math.abs(value),
    isPositive: value >= 0
  };
};

/**
 * Enhanced version of calculateEngagementGrowth that returns GrowthData instead of number
 * This addresses compatibility issues where some features expect GrowthData objects
 */
export const calculateEngagementGrowth = (dailyData: DailyData[]): GrowthData => {
  const value = _calculateEngagementGrowthNumber(dailyData);
  return {
    value: Math.abs(value),
    isPositive: value >= 0
  };
};