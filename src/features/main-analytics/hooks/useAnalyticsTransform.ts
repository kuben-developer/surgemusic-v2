import { useMemo } from 'react';
import type { VideoMetric } from '@/components/analytics/types';
import type { AnalyticsData } from '../types/analytics.types';

interface UseAnalyticsTransformReturn {
  mappedVideoMetrics: VideoMetric[];
  campaignCount: number;
  totalVideos: number;
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    totalVideos: number;
  };
  dailyData: any[];
  avgEngagementRate: string;
  campaigns: any[];
}

/**
 * Custom hook for transforming raw analytics data into a format
 * suitable for UI components
 */
export function useAnalyticsTransform(data: AnalyticsData | null): UseAnalyticsTransformReturn {
  return useMemo(() => {
    if (!data) {
      return {
        mappedVideoMetrics: [],
        campaignCount: 0,
        totalVideos: 0,
        totals: { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: 0 },
        dailyData: [],
        avgEngagementRate: "0",
        campaigns: []
      };
    }

    const { 
      dailyData = [], 
      avgEngagementRate = "0", 
      campaigns = [], 
      videoMetrics = [], 
      totals = { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: 0 } 
    } = data;
    
    // Map videoMetrics to have the expected 'id' field and ensure proper data structure
    const mappedVideoMetrics = videoMetrics.map((vm: VideoMetric) => ({
      ...vm,
      id: vm._id || vm.id || Math.random().toString(36).substr(2, 9),
      videoInfo: {
        ...vm.videoInfo,
        id: vm.videoInfo._id || vm.videoInfo.id || Math.random().toString(36).substr(2, 9),
        tiktokUrl: vm.videoInfo.tiktokUrl || '',
        createdAt: vm.videoInfo._creationTime ? new Date(vm.videoInfo._creationTime) : new Date(),
        campaign: {
          id: parseInt(vm.videoInfo.campaign?.id?.toString() || '0'),
          campaignName: vm.videoInfo.campaign?.campaignName || ''
        }
      }
    }));

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