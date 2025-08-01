import type { VideoMetric, DailyData, Totals, Campaign } from '@/types/analytics.types';

/**
 * Utility functions for transforming analytics data
 * Separated from hooks for better testability and reusability
 */

/**
 * Transforms video metrics to ensure proper data structure and add fallback values
 */
export function transformVideoMetrics(videoMetrics: VideoMetric[] = []): VideoMetric[] {
  return videoMetrics.map((vm: VideoMetric) => {
    // Handle Convex-specific properties that might exist at runtime
    const videoInfoWithConvex = vm.videoInfo as VideoMetric['videoInfo'] & { _id?: string; _creationTime?: number };
    const hasConvexId = videoInfoWithConvex && '_id' in videoInfoWithConvex;
    const hasConvexTime = videoInfoWithConvex && '_creationTime' in videoInfoWithConvex;
    
    return {
      ...vm,
      // Use the video's _id as the metric ID (metrics don't have their own IDs)
      id: (hasConvexId ? videoInfoWithConvex._id : vm.videoInfo?.id) ?? generateRandomId(),
      videoInfo: vm.videoInfo ? {
        ...vm.videoInfo,
        // Standardize on the existing id property
        id: (hasConvexId ? videoInfoWithConvex._id : vm.videoInfo.id) ?? generateRandomId(),
        tiktokUrl: vm.videoInfo.tiktokUrl ?? '',
        createdAt: hasConvexTime && videoInfoWithConvex._creationTime
          ? new Date(videoInfoWithConvex._creationTime) 
          : (vm.videoInfo.createdAt instanceof Date ? vm.videoInfo.createdAt : new Date()),
        campaign: vm.videoInfo.campaign ? {
          // Handle both Convex _id and standard id
          id: (() => {
            const campaignWithConvex = vm.videoInfo.campaign as typeof vm.videoInfo.campaign & { _id?: string };
            if ('_id' in campaignWithConvex && typeof campaignWithConvex._id === 'string') {
              return parseInt(campaignWithConvex._id, 10) ?? 0;
            }
            return vm.videoInfo.campaign.id ?? 0;
          })(),
          campaignName: vm.videoInfo.campaign.campaignName ?? ''
        } : {
          id: 0,
          campaignName: ''
        }
      } : {
        // Fallback structure if videoInfo is missing
        id: generateRandomId(),
        postId: null,
        videoUrl: '',
        videoName: '',
        videoType: '',
        tiktokUrl: '',
        createdAt: new Date(),
        campaign: {
          id: 0,
          campaignName: ''
        }
      }
    };
  });
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