"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { ReportAnalyticsData, GrowthData } from "../../shared/types/report.types";

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

  const calculateGrowthData = useCallback((data: ReportAnalyticsData): AnalyticsGrowthData => {
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
      const data = await getReportAnalytics({ 
        id: reportId as Id<"reports">, 
        days: parseInt(dateRange) 
      });
      
      const growthData = calculateGrowthData(data);
      
      setState(prev => ({
        ...prev,
        analyticsData: data,
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