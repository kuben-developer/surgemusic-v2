import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { ReportAnalyticsData } from "../../shared/types/report.types";

interface UseReportAnalyticsDataProps {
  reportId: string | null;
  dateRange: string;
}

interface UseReportAnalyticsDataReturn {
  analyticsData: ReportAnalyticsData | null;
  isLoadingAnalytics: boolean;
  isRefreshing: boolean;
  refetchAnalytics: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

export function useReportAnalyticsData({ 
  reportId, 
  dateRange 
}: UseReportAnalyticsDataProps): UseReportAnalyticsDataReturn {
  const [analyticsData, setAnalyticsData] = useState<ReportAnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getReportAnalytics = useAction(api.analytics.getReportAnalytics);

  const refetchAnalytics = async () => {
    if (!reportId) return;
    setIsLoadingAnalytics(true);
    try {
      const data = await getReportAnalytics({ 
        id: reportId as Id<"reports">, 
        days: parseInt(dateRange) 
      });
      setAnalyticsData(data);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const refreshAnalytics = async () => {
    setIsRefreshing(true);
    try {
      await refetchAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refetchAnalytics();
  }, [reportId, dateRange]);

  return {
    analyticsData,
    isLoadingAnalytics,
    isRefreshing,
    refetchAnalytics,
    refreshAnalytics,
  };
}