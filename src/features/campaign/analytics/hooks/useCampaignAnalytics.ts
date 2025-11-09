"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { CampaignAnalyticsData, DateFilter } from "../types/analytics.types";

export function useCampaignAnalytics(campaignId: string) {
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getCampaignAnalytics = useAction(api.app.bundleSocial.getCampaignAnalyticsWithMetadata);
  const getPostCounts = useAction(api.app.bundleSocial.getPostCountsByDate);

  const [analyticsData, setAnalyticsData] = useState<CampaignAnalyticsData | null>(null);
  const [postCountsByDate, setPostCountsByDate] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async (filter: DateFilter | null = dateFilter) => {
    try {
      setIsLoading(true);
      setError(null);

      let data;

      if (filter) {
        // Convert dates to Unix timestamps (seconds) in UTC
        // Use UTC methods to extract date components since we're working in UTC
        // Set start time to beginning of day (00:00:00 UTC)
        const startOfDay = new Date(Date.UTC(
          filter.startDate.getUTCFullYear(),
          filter.startDate.getUTCMonth(),
          filter.startDate.getUTCDate(),
          0, 0, 0, 0
        ));
        const postedStartDate = Math.floor(startOfDay.getTime() / 1000);

        // Set end time to end of day (23:59:59 UTC)
        const endOfDay = new Date(Date.UTC(
          filter.endDate.getUTCFullYear(),
          filter.endDate.getUTCMonth(),
          filter.endDate.getUTCDate(),
          23, 59, 59, 999
        ));
        const postedEndDate = Math.floor(endOfDay.getTime() / 1000);

        data = await getCampaignAnalytics({
          campaignId,
          postedStartDate,
          postedEndDate,
        });
      } else {
        // No filter - show all videos (default 30 days)
        data = await getCampaignAnalytics({
          campaignId,
          days: 30,
        });
      }

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
    await fetchAnalytics(dateFilter);
    setIsRefreshing(false);
  };

  // Change date filter
  const changeDateFilter = async (filter: DateFilter | null) => {
    setDateFilter(filter);
    await fetchAnalytics(filter);
  };

  // Fetch post counts by date
  const fetchPostCounts = async () => {
    try {
      const counts = await getPostCounts({ campaignId });
      setPostCountsByDate(counts);
    } catch (err) {
      console.error('Error fetching post counts:', err);
      // Don't set error state - this is non-critical data
    }
  };

  // Initial fetch
  useEffect(() => {
    void fetchAnalytics(null);
    void fetchPostCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  return {
    analyticsData,
    postCountsByDate,
    isLoading,
    isRefreshing,
    error,
    dateFilter,
    changeDateFilter,
    refreshAnalytics,
  };
}
