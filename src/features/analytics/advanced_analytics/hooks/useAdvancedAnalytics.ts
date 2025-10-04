"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { AdvancedAnalyticsResponse, AdvancedVideoMetric } from "../types/advanced-analytics.types";

interface UseAdvancedAnalyticsOptions {
  selectedCampaigns: string[];
}

interface UseAdvancedAnalyticsReturn {
  data: AdvancedAnalyticsResponse | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function useAdvancedAnalytics(
  options: UseAdvancedAnalyticsOptions
): UseAdvancedAnalyticsReturn {
  const [data, setData] = useState<AdvancedAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getAdvancedAnalytics = useAction(api.app.advanced_analytics.getAdvancedAnalytics);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdvancedAnalytics({
        campaignIds: options.selectedCampaigns.length > 0
          ? options.selectedCampaigns
          : undefined,
      });

      setData(result);
    } catch (err) {
      console.error("Error fetching advanced analytics:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch advanced analytics"));
    } finally {
      setIsLoading(false);
    }
  }, [options.selectedCampaigns, getAdvancedAnalytics]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    isRefreshing,
  };
}
