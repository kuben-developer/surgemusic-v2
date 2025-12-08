"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { CampaignAnalyticsData, DateFilter } from "../types/analytics.types";

/**
 * Helper function to convert Date to DD-MM-YYYY format
 */
function formatDateToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Helper function to get all dates between start and end (inclusive)
 */
function getDatesBetween(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(formatDateToDDMMYYYY(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function useCampaignAnalytics(campaignId: string) {
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);

  // Convert date filter to array of DD-MM-YYYY strings for post dates
  const postDatesFilter = useMemo(() => {
    if (!dateFilter) return undefined;
    return getDatesBetween(dateFilter.startDate, dateFilter.endDate);
  }, [dateFilter]);

  // Fetch campaign analytics
  const analyticsResult = useQuery(
    api.app.analytics.getCampaignAnalytics,
    { campaignId, dates: postDatesFilter }
  );

  // Fetch post counts by date (for calendar)
  const postCountsByDate = useQuery(
    api.app.analytics.getPostCountsByDate,
    { campaignId }
  );

  // Build analytics data (video metrics now handled separately by useVideoPerformance)
  const analyticsData: CampaignAnalyticsData | null = useMemo(() => {
    if (!analyticsResult) return null;

    return {
      campaignId: analyticsResult.campaignId,
      totals: analyticsResult.totals,
      dailyData: analyticsResult.dailyData,
      lastUpdatedAt: analyticsResult.lastUpdatedAt,
      campaignMetadata: analyticsResult.campaignMetadata,
    };
  }, [analyticsResult]);

  // Loading state
  const isLoading = analyticsResult === undefined;

  // Change date filter
  const changeDateFilter = (filter: DateFilter | null) => {
    setDateFilter(filter);
  };

  return {
    analyticsData,
    postCountsByDate: postCountsByDate ?? {},
    postDatesFilter, // Expose for useVideoPerformance hook
    isLoading,
    isRefreshing: false, // No manual refresh needed with Convex real-time queries
    error: null, // Convex handles errors differently, can be enhanced if needed
    dateFilter,
    changeDateFilter,
    refreshAnalytics: () => {}, // No-op since Convex queries auto-refresh
  };
}
