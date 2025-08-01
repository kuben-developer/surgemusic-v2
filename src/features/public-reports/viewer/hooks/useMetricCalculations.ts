import { useMemo } from 'react';
import type { SharedReportData, MetricKey, GrowthResult } from '../types';
import { calculateGrowth } from '../utils/metric-calculations';

export const useMetricCalculations = (data: SharedReportData | null) => {
  const viewsGrowth = useMemo(() => 
    data?.dailyData ? calculateGrowth(data.dailyData, 'views') : { value: 0, isPositive: true },
    [data?.dailyData]
  );

  const likesGrowth = useMemo(() => 
    data?.dailyData ? calculateGrowth(data.dailyData, 'likes') : { value: 0, isPositive: true },
    [data?.dailyData]
  );

  const commentsGrowth = useMemo(() => 
    data?.dailyData ? calculateGrowth(data.dailyData, 'comments') : { value: 0, isPositive: true },
    [data?.dailyData]
  );

  const sharesGrowth = useMemo(() => 
    data?.dailyData ? calculateGrowth(data.dailyData, 'shares') : { value: 0, isPositive: true },
    [data?.dailyData]
  );

  const engagementGrowth = useMemo(() => 
    data?.dailyData ? calculateGrowth(data.dailyData, 'engagement') : { value: 0, isPositive: true },
    [data?.dailyData]
  );

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

  const campaignCount = useMemo(() => 
    data?.campaigns?.length || 0,
    [data?.campaigns]
  );

  return {
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    sharesGrowth,
    engagementGrowth,
    visibleVideoMetrics,
    campaignCount,
    totals: data?.totals,
    totalVideos: data?.totals?.totalVideos
  };
};