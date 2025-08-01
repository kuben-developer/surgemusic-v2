import type { DailyData, MetricKey, GrowthData } from '@/types/analytics.types';

/**
 * Calculate growth percentage between two halves of a dataset
 * Used by main analytics and campaign analytics features
 */
export const calculateGrowth = (data: DailyData[], metric: MetricKey | 'engagement'): GrowthData => {
  if (!data || data.length < 2) return { value: 0, isPositive: true };

  const halfPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, halfPoint);
  const secondHalf = data.slice(halfPoint);

  const calculateTotal = (arr: DailyData[]) => arr.reduce((sum, day) => {
    if (metric === 'engagement') {
      const dailyEng = ((day.likes + day.comments + day.shares) / Math.max(day.views, 1)) * 100;
      return sum + (isNaN(dailyEng) ? 0 : dailyEng);
    } else {
      return sum + (day[metric as MetricKey] || 0);
    }
  }, 0);

  const firstHalfTotal = calculateTotal(firstHalf);
  const secondHalfTotal = calculateTotal(secondHalf);

  if (metric === 'engagement') {
    const firstHalfAvg = firstHalf.length > 0 ? firstHalfTotal / firstHalf.length : 0;
    const secondHalfAvg = secondHalf.length > 0 ? secondHalfTotal / secondHalf.length : 0;
    if (firstHalfAvg === 0) return { value: secondHalfAvg > 0 ? 100 : 0, isPositive: true };
    const growthPercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    return {
      value: Math.abs(Math.round(growthPercent * 10) / 10),
      isPositive: growthPercent >= 0
    };
  } else {
    if (firstHalfTotal === 0) return { value: secondHalfTotal > 0 ? 100 : 0, isPositive: true };
    const growthPercent = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
    return {
      value: Math.abs(Math.round(growthPercent * 10) / 10),
      isPositive: growthPercent >= 0
    };
  }
};

/**
 * Alternative growth calculation using recent vs previous weeks
 * Used by reports feature
 */
export const calculateWeeklyGrowth = (data: Array<Record<string, number>>, metricKey: string): GrowthData => {
  if (!data || data.length < 2) return { value: 0, isPositive: true };

  const recent = data.slice(-7);
  const previous = data.slice(-14, -7);

  const recentSum = recent.reduce((sum, day) => sum + (day[metricKey] ?? 0), 0);
  const previousSum = previous.reduce((sum, day) => sum + (day[metricKey] ?? 0), 0);

  if (previousSum === 0) return { value: 0, isPositive: true };

  const growth = ((recentSum - previousSum) / previousSum) * 100;
  return {
    value: Math.abs(Math.round(growth)),
    isPositive: growth >= 0
  };
};

/**
 * Calculate growth for a specific metric on sorted data
 * Used by campaign analytics feature
 */
export const calculateMetricGrowth = (dailyData: DailyData[], metric: string): number => {
  if (!dailyData || dailyData.length < 2) return 0;
  
  const sortedData = [...dailyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (sortedData.length < 2) return 0;
  
  const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
  const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
  
  const firstHalfTotal = firstHalf.reduce((sum, day) => sum + (day[metric as keyof DailyData] as number || 0), 0);
  const secondHalfTotal = secondHalf.reduce((sum, day) => sum + (day[metric as keyof DailyData] as number || 0), 0);
  
  if (firstHalfTotal === 0) return secondHalfTotal > 0 ? 100 : 0;
  
  return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
};

/**
 * Calculate engagement growth specifically
 * Used by campaign analytics feature
 */
export const calculateEngagementGrowth = (dailyData: DailyData[]): number => {
  const engagementData = dailyData.map((day) => ({
    ...day,
    engagement: ((day.likes + day.comments + day.shares) / Math.max(day.views, 1)) * 100
  }));
  
  return calculateMetricGrowth(engagementData, 'engagement');
};