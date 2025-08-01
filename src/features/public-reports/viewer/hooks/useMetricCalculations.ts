'use client';

import { useMemo } from 'react';
import type { SharedReportData, MetricKey, GrowthResult } from '../types';
import { calculateGrowth } from '../utils/metric-calculations';

const DEFAULT_GROWTH: GrowthResult = { value: 0, isPositive: true };

export const useMetricCalculations = (data: SharedReportData | null) => {
  // Calculate all growth metrics in a single useMemo to avoid multiple recalculations
  const growthMetrics = useMemo(() => {
    if (!data?.dailyData) {
      return {
        viewsGrowth: DEFAULT_GROWTH,
        likesGrowth: DEFAULT_GROWTH,
        commentsGrowth: DEFAULT_GROWTH,
        sharesGrowth: DEFAULT_GROWTH,
        engagementGrowth: DEFAULT_GROWTH
      };
    }

    return {
      viewsGrowth: calculateGrowth(data.dailyData, 'views'),
      likesGrowth: calculateGrowth(data.dailyData, 'likes'),
      commentsGrowth: calculateGrowth(data.dailyData, 'comments'),
      sharesGrowth: calculateGrowth(data.dailyData, 'shares'),
      engagementGrowth: calculateGrowth(data.dailyData, 'engagement')
    };
  }, [data?.dailyData]);

  const visibleVideoMetrics = useMemo(() => {
    const filtered = data?.videoMetrics?.filter(
      (vm) => !data.hiddenVideoIds?.includes(vm.videoInfo.id)
    ) || [];
    
    // Map to match VideoMetric interface
    return filtered.map(vm => ({
      id: vm.id,
      views: vm.views,
      likes: vm.likes,
      comments: vm.comments,
      shares: vm.shares,
      engagementRate: vm.engagementRate,
      videoInfo: {
        id: vm.videoInfo.id,
        postId: null,
        videoUrl: vm.videoInfo.videoUrl,
        videoName: vm.videoInfo.videoName,
        videoType: vm.videoInfo.videoType,
        tiktokUrl: vm.videoInfo.tiktokUrl || '',
        createdAt: new Date(vm.videoInfo.createdAt),
        campaign: {
          id: parseInt(vm.videoInfo.campaign.id),
          campaignName: vm.videoInfo.campaign.campaignName
        }
      }
    }));
  }, [data?.videoMetrics, data?.hiddenVideoIds]);

  // Simple calculations that don't need separate useMemo
  const campaignCount = data?.campaigns?.length || 0;
  const totals = data?.totals;
  const totalVideos = data?.totals?.totalVideos;

  return {
    ...growthMetrics,
    visibleVideoMetrics,
    campaignCount,
    totals,
    totalVideos
  };
};