// Re-export shared types for backward compatibility
export * from '@/types/analytics.types';

// Legacy aliases for backward compatibility
export type DailyMetric = import('@/types/analytics.types').DailyData;
export type GrowthMetric = import('@/types/analytics.types').GrowthData;