import type { VideoMetric, DailyData, Totals, Campaign } from '@/types/analytics.types';

/**
 * Utility functions for transforming analytics data
 * Separated from hooks for better testability and reusability
 */

/**
 * Transforms video metrics to ensure proper data structure and add fallback values
 */
export function transformVideoMetrics(videoMetrics: VideoMetric[] = []): VideoMetric[] {
  return videoMetrics.map((vm: VideoMetric) => ({
    ...vm,
    id: vm._id || vm.id || generateRandomId(),
    videoInfo: {
      ...vm.videoInfo,
      id: vm.videoInfo._id || vm.videoInfo.id || generateRandomId(),
      tiktokUrl: vm.videoInfo.tiktokUrl || '',
      createdAt: vm.videoInfo._creationTime 
        ? new Date(vm.videoInfo._creationTime) 
        : new Date(),
      campaign: {
        id: parseInt(vm.videoInfo.campaign?.id?.toString() || '0'),
        campaignName: vm.videoInfo.campaign?.campaignName || ''
      }
    }
  }));
}

/**
 * Creates default totals object when no data is available
 */
export function createDefaultTotals() {
  return {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    totalVideos: 0
  };
}

/**
 * Creates default analytics transform result
 */
export function createDefaultTransformResult(): {
  mappedVideoMetrics: VideoMetric[];
  campaignCount: number;
  totalVideos: number;
  totals: Totals & { totalVideos: number };
  dailyData: DailyData[];
  avgEngagementRate: string;
  campaigns: Campaign[];
} {
  return {
    mappedVideoMetrics: [] as VideoMetric[],
    campaignCount: 0,
    totalVideos: 0,
    totals: createDefaultTotals(),
    dailyData: [] as DailyData[],
    avgEngagementRate: "0",
    campaigns: [] as Campaign[]
  };
}

/**
 * Generates a random ID for fallback purposes
 */
function generateRandomId(): string {
  return Math.random().toString(36).substr(2, 9);
}