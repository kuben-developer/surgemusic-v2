"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { ReportAnalyticsData, GrowthData, VideoMetric } from "../../shared/types/report.types";
import type { AnalyticsResponse } from "../../../../../convex/app/analytics";

interface UseReportAnalyticsDataProps {
  reportId: string | null;
  dateRange: string;
}

interface AnalyticsState {
  analyticsData: ReportAnalyticsData | null;
  growthData: AnalyticsGrowthData | null;
  isLoadingAnalytics: boolean;
  isRefreshing: boolean;
}

interface AnalyticsGrowthData {
  viewsGrowth: GrowthData;
  likesGrowth: GrowthData;
  commentsGrowth: GrowthData;
  sharesGrowth: GrowthData;
  engagementGrowth: GrowthData;
}

interface UseReportAnalyticsDataReturn extends AnalyticsState {
  refetchAnalytics: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

export function useReportAnalyticsData({ 
  reportId, 
  dateRange 
}: UseReportAnalyticsDataProps): UseReportAnalyticsDataReturn {
  const [state, setState] = useState<AnalyticsState>({
    analyticsData: null,
    growthData: null,
    isLoadingAnalytics: true,
    isRefreshing: false,
  });

  const getReportAnalytics = useAction(api.app.analytics.getReportAnalyticsV2);

  const calculateGrowthData = useCallback((): AnalyticsGrowthData => {
    // Calculate growth metrics based on the data
    // This is a placeholder - actual implementation would compare current vs previous period
    return {
      viewsGrowth: { value: 12.5, isPositive: true },
      likesGrowth: { value: 8.3, isPositive: true },
      commentsGrowth: { value: -2.1, isPositive: false },
      sharesGrowth: { value: 15.7, isPositive: true },
      engagementGrowth: { value: 6.9, isPositive: true },
    };
  }, []);

  const refetchAnalytics = useCallback(async () => {
    if (!reportId) return;
    
    setState(prev => ({ ...prev, isLoadingAnalytics: true }));
    
    try {
      const rawData: AnalyticsResponse = await getReportAnalytics({ 
        reportId: reportId as Id<"reports">, 
        days: parseInt(dateRange) 
      });
      
      // Transform video metrics to match expected structure
      const transformedData: ReportAnalyticsData = {
        dailyData: (rawData.dailyMetrics || []).map(day => ({
          date: day.date,
          views: day.views,
          likes: day.likes,
          comments: day.comments,
          shares: day.shares
        })),
        avgEngagementRate: rawData.metrics?.engagementRate 
          ? (rawData.metrics.engagementRate * 100).toFixed(2)
          : "0.00",
        videoMetrics: (rawData.videoMetrics || []).map((vm: any, index: number): VideoMetric => {
          const videoId = vm.videoId || vm.id || '';
          const views = vm.metrics?.views || vm.views || 0;
          const likes = vm.metrics?.likes || vm.likes || 0;
          const comments = vm.metrics?.comments || vm.comments || 0;
          const shares = vm.metrics?.shares || vm.shares || 0;
          const engagement = likes + comments + shares;
          const engagementRate = views > 0 ? ((engagement / views) * 100).toFixed(2) : "0.00";
          
          return {
            id: videoId,
            views,
            likes,
            comments,
            shares,
            engagementRate,
            videoInfo: {
              id: videoId,
              postId: null,
              videoUrl: vm.videoUrl || '',
              videoName: vm.videoName || `Video ${videoId.slice(-6)}`,
              videoType: 'video/mp4',
              tiktokUrl: vm.platform === 'tiktok' ? vm.videoUrl : '',
              createdAt: new Date(vm.postedAt || Date.now()),
              campaign: {
                id: index,
                campaignName: vm.campaignName || ''
              }
            }
          };
        }),
        // Ensure hiddenVideoIds is accessible at root level
        hiddenVideoIds: rawData.metadata?.hiddenVideoIds || [],
        totals: {
          views: rawData.metrics?.views || 0,
          likes: rawData.metrics?.likes || 0,
          comments: rawData.metrics?.comments || 0,
          shares: rawData.metrics?.shares || 0
        },
        lastUpdatedAt: rawData.metadata?.lastUpdatedAt ? String(rawData.metadata.lastUpdatedAt) : null
      };
      
      const growthData = calculateGrowthData();
      
      setState(prev => ({
        ...prev,
        analyticsData: transformedData,
        growthData,
        isLoadingAnalytics: false,
      }));
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      setState(prev => ({ ...prev, isLoadingAnalytics: false }));
    }
  }, [reportId, dateRange, getReportAnalytics, calculateGrowthData]);

  const refreshAnalytics = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      await refetchAnalytics();
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [refetchAnalytics]);

  useEffect(() => {
    void refetchAnalytics();
  }, [refetchAnalytics]);

  return {
    ...state,
    refetchAnalytics,
    refreshAnalytics,
  };
}