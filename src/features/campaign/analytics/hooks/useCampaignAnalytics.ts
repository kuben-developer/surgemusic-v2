"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { CampaignAnalyticsData, DateRange } from "../types/analytics.types";

export function useCampaignAnalytics(campaignId: string) {
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getCampaignAnalytics = useAction(api.app.bundleSocial.getCampaignAnalyticsWithMetadata);
  const [analyticsData, setAnalyticsData] = useState<CampaignAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async (days: DateRange = dateRange) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getCampaignAnalytics({
        campaignId,
        days,
      });

      setAnalyticsData(data as CampaignAnalyticsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh analytics
  const refreshAnalytics = async () => {
    setIsRefreshing(true);
    await fetchAnalytics(dateRange);
    setIsRefreshing(false);
  };

  // Change date range
  const changeDateRange = async (days: DateRange) => {
    setDateRange(days);
    await fetchAnalytics(days);
  };

  // Initial fetch
  useEffect(() => {
    fetchAnalytics(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  return {
    analyticsData,
    isLoading,
    isRefreshing,
    error,
    dateRange,
    changeDateRange,
    refreshAnalytics,
  };
}
