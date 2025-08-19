"use client"

import { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { AnalyticsData } from '../types/analytics.types';

interface UseAnalyticsDataOptions {
  selectedCampaigns: string[];
  dateRange: string;
}

interface UseAnalyticsDataReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAnalyticsData({ selectedCampaigns, dateRange }: UseAnalyticsDataOptions): UseAnalyticsDataReturn {
  const getCombinedAnalytics = useAction(api.app.analytics.getCombinedAnalytics);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const analyticsData = await getCombinedAnalytics({
        campaignIds: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
        days: parseInt(dateRange)
      });
      setData(analyticsData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCampaigns, dateRange]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
}