import type { DailyData, MetricKey, GrowthData } from '@/components/analytics/types';

// Helper function to calculate growth percentages
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