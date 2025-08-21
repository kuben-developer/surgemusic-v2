"use client";

import { useMemo } from "react";
import { useReportAnalyticsData } from "./useReportAnalyticsData";
import { useAnalyticsState } from "./useAnalyticsState";
import type { 
  AnalyticsContentReport,
  AnalyticsContentData,
  AnalyticsContentGrowth,
  AnalyticsContentState,
  AnalyticsContentHandlers 
} from "../types/analytics-content.types";
import type { VideoMetric } from "../../shared/types/report.types";

interface UseReportAnalyticsProps {
  reportId: string | null;
  report: AnalyticsContentReport;
}

interface ProcessedAnalyticsData {
  visibleVideoMetrics: VideoMetric[];
  totalVideos: number;
  campaignCount: number;
  transformedCampaigns: Array<{ id: string; campaignName: string }>;
  campaignIds: string[];
}

interface UseReportAnalyticsReturn {
  // Data
  analyticsData: AnalyticsContentData | null;
  growthData: AnalyticsContentGrowth | null;
  processedData: ProcessedAnalyticsData;
  
  // State
  state: AnalyticsContentState;
  handlers: AnalyticsContentHandlers;
  
  // Loading states
  isLoadingAnalytics: boolean;
  
  // Actions
  refreshAnalytics: () => Promise<void>;
}

export function useReportAnalytics({ 
  reportId, 
  report 
}: UseReportAnalyticsProps): UseReportAnalyticsReturn {
  
  // Analytics state management (date range, active metric, pagination, etc.)
  const analyticsState = useAnalyticsState();
  
  // Data fetching
  const {
    analyticsData,
    growthData,
    isLoadingAnalytics,
    isRefreshing,
    refreshAnalytics,
  } = useReportAnalyticsData({
    reportId,
    dateRange: analyticsState.dateRange,
  });

  // Process data for components
  const processedData = useMemo((): ProcessedAnalyticsData => {
    if (!analyticsData) {
      return {
        visibleVideoMetrics: [],
        totalVideos: 0,
        campaignCount: 0,
        transformedCampaigns: [],
        campaignIds: [],
      };
    }

    const { videoMetrics, hiddenVideoIds = [] } = analyticsData;
    
    // Filter out hidden videos from videoMetrics for display
    const visibleVideoMetrics = videoMetrics.filter(
      (vm: VideoMetric) => {
        // Use the videoInfo.id from the transformed data
        const videoId = vm.videoInfo?.id;
        return videoId && !hiddenVideoIds.includes(videoId);
      }
    );

    const totalVideos = visibleVideoMetrics.length;
    const campaignCount = report.campaigns.length || 0;

    // Transform campaigns for header
    const transformedCampaigns = report.campaigns.map(c => ({
      id: c.id,
      campaignName: c.campaignName
    }));

    // Transform campaign IDs for comments section
    const campaignIds = report.campaigns.map(c => c.id);

    return {
      visibleVideoMetrics,
      totalVideos,
      campaignCount,
      transformedCampaigns,
      campaignIds,
    };
  }, [report, analyticsData]);

  // Create state and handlers for AnalyticsContent component
  const state: AnalyticsContentState = {
    dateRange: analyticsState.dateRange,
    activeMetric: analyticsState.activeMetric,
    currentPage: analyticsState.currentPage,
    selectedCampaigns: analyticsState.selectedCampaigns,
    itemsPerPage: analyticsState.itemsPerPage,
    isRefreshing,
  };

  const handlers: AnalyticsContentHandlers = {
    onDateRangeChange: analyticsState.handleDateRangeChange,
    onCampaignChange: analyticsState.handleCampaignChange,
    onResetCampaigns: analyticsState.handleResetCampaigns,
    onRefresh: refreshAnalytics,
    onActiveMetricChange: analyticsState.setActiveMetric,
    onPageChange: analyticsState.setCurrentPage,
  };

  return {
    // Data
    analyticsData: analyticsData as AnalyticsContentData | null,
    growthData: growthData as AnalyticsContentGrowth | null,
    processedData,
    
    // State
    state,
    handlers,
    
    // Loading
    isLoadingAnalytics,
    
    // Actions
    refreshAnalytics,
  };
}