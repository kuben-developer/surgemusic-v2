"use client"

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { AnalyticsData, GrowthMetric } from "../types/analytics.types";

interface UseAnalyticsDataProps {
  campaignId: string;
}

export function useAnalyticsData({ campaignId }: UseAnalyticsDataProps) {
  const [dateRange, setDateRange] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  const getAnalytics = useAction(api.app.analytics.getAnalytics);

  // Fetch analytics data on mount and when dependencies change
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!campaignId) return;
      setIsAnalyticsLoading(true);
      try {
        const data = await getAnalytics({
          campaignId: campaignId as Id<"campaigns">,
          days: parseInt(dateRange)
        });
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [campaignId, dateRange, getAnalytics]);

  // Function to handle date range changes
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  // Function to refresh analytics data
  const refreshAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const data = await getAnalytics({
        campaignId: campaignId as Id<"campaigns">,
        days: parseInt(dateRange)
      });
      setAnalyticsData(data);
      toast.success("Latest analytics data has been loaded");
    } catch (error) {
      toast.error("Error refreshing analytics. Please try again later.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate growth percentages
  const calculateGrowth = (data: { [key: string]: number }[], metric: string): GrowthMetric => {
    if (!data || data.length < 2) return { value: 0, isPositive: true };

    // Split data into two equal periods
    const halfPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, halfPoint);
    const secondHalf = data.slice(halfPoint);

    // Calculate totals for each half
    const firstHalfTotal = firstHalf.reduce((sum, day) => sum + (day[metric] || 0), 0);
    const secondHalfTotal = secondHalf.reduce((sum, day) => sum + (day[metric] || 0), 0);

    // Calculate growth percentage
    if (firstHalfTotal === 0) return { value: secondHalfTotal > 0 ? 100 : 0, isPositive: true };

    const growthPercent = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
    return {
      value: Math.abs(Math.round(growthPercent * 10) / 10), // Round to 1 decimal
      isPositive: growthPercent >= 0
    };
  };

  return {
    dateRange,
    isRefreshing,
    analyticsData,
    isAnalyticsLoading,
    handleDateRangeChange,
    refreshAnalytics,
    calculateGrowth,
  };
}