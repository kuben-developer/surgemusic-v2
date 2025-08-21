"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { 
  AnalyticsResponse, 
  UseAnalyticsOptions, 
  GrowthMetrics,
  MetricKey,
  DailyMetric 
} from "../types/analytics.types";

interface UseAnalyticsReturn {
  // Data
  data: AnalyticsResponse | null;
  isLoading: boolean;
  error: Error | null;
  
  // State
  dateRange: number;
  activeMetric: MetricKey;
  selectedCampaigns: string[];
  isRefreshing: boolean;
  
  // Actions
  setDateRange: (days: number) => void;
  setActiveMetric: (metric: MetricKey) => void;
  setSelectedCampaigns: (campaigns: string[]) => void;
  refresh: () => Promise<void>;
  
  // Computed
  growth: GrowthMetrics | null;
  formattedEngagementRate: string;
}

export function useAnalytics(options: UseAnalyticsOptions): UseAnalyticsReturn {
  // State
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dateRange, setDateRange] = useState(options.initialDateRange || 30);
  const [activeMetric, setActiveMetric] = useState<MetricKey>('views');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(options.selectedCampaigns || []);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Actions based on type
  const getCampaignAnalytics = useAction(api.app.analytics.getCampaignAnalytics);
  const getReportAnalyticsV2 = useAction(api.app.analytics.getReportAnalyticsV2);

  // Calculate growth metrics
  const growth = useMemo(() => {
    if (!data?.dailyMetrics || data.dailyMetrics.length < 2) return null;

    const calculateGrowth = (metrics: DailyMetric[], key: MetricKey): GrowthData => {
      const halfPoint = Math.floor(metrics.length / 2);
      const firstHalf = metrics.slice(0, halfPoint);
      const secondHalf = metrics.slice(halfPoint);

      const firstTotal = firstHalf.reduce((sum, day) => sum + (day[key] || 0), 0);
      const secondTotal = secondHalf.reduce((sum, day) => sum + (day[key] || 0), 0);

      if (firstTotal === 0) {
        return { value: secondTotal > 0 ? 100 : 0, isPositive: true };
      }

      const growthPercent = ((secondTotal - firstTotal) / firstTotal) * 100;
      return {
        value: Math.abs(Math.round(growthPercent * 10) / 10),
        isPositive: growthPercent >= 0
      };
    };

    return {
      views: calculateGrowth(data.dailyMetrics, 'views'),
      likes: calculateGrowth(data.dailyMetrics, 'likes'),
      comments: calculateGrowth(data.dailyMetrics, 'comments'),
      shares: calculateGrowth(data.dailyMetrics, 'shares'),
      engagement: {
        value: data.metrics.engagementRate > 0 ? 
          Math.round(data.metrics.engagementRate * 1000) / 10 : 0,
        isPositive: true
      }
    };
  }, [data]);

  // Format engagement rate for display
  const formattedEngagementRate = useMemo(() => {
    if (!data?.metrics.engagementRate) return "0.0%";
    return `${(data.metrics.engagementRate * 100).toFixed(1)}%`;
  }, [data]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result: AnalyticsResponse;

      if (options.type === 'report' && options.entityId) {
        // Fetch report analytics
        result = await getReportAnalyticsV2({
          reportId: options.entityId as Id<"reports">,
          days: dateRange
        });
      } else if (options.type === 'campaign' && options.entityId) {
        // Fetch single campaign analytics
        result = await getCampaignAnalytics({
          campaignIds: [options.entityId],
          days: dateRange
        });
      } else {
        // Fetch main analytics (all or selected campaigns)
        result = await getCampaignAnalytics({
          campaignIds: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
          days: dateRange
        });
      }

      setData(result);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch analytics"));
    } finally {
      setIsLoading(false);
    }
  }, [options.type, options.entityId, selectedCampaigns, dateRange, getCampaignAnalytics, getReportAnalyticsV2]);

  // Refresh function
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchAnalytics]);

  // Initial fetch and refetch on dependencies change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    // Data
    data,
    isLoading,
    error,
    
    // State
    dateRange,
    activeMetric,
    selectedCampaigns,
    isRefreshing,
    
    // Actions
    setDateRange,
    setActiveMetric,
    setSelectedCampaigns,
    refresh,
    
    // Computed
    growth,
    formattedEngagementRate
  };
}

// Helper type
interface GrowthData {
  value: number;
  isPositive: boolean;
}