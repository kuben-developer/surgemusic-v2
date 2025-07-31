'use client';

import { useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsContent } from './components/AnalyticsContent';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { useAnalyticsFilters } from './hooks/useAnalyticsFilters';
import { useAnalyticsRefresh } from './hooks/useAnalyticsRefresh';

export function AnalyticsPage() {
  // Filters and pagination
  const {
    selectedCampaigns,
    handleCampaignChange,
    handleResetCampaigns,
    dateRange,
    handleDateRangeChange,
    activeMetric,
    setActiveMetric,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  } = useAnalyticsFilters();

  // Fetch campaigns data
  const allCampaigns = useQuery(api.campaigns.getAll);
  const isCampaignsLoading = allCampaigns === undefined;

  // Fetch analytics data
  const { data, isLoading: isAnalyticsLoading, error, refetch } = useAnalyticsData({ 
    selectedCampaigns, 
    dateRange 
  });

  // Refresh functionality
  const { isRefreshing, refreshAnalytics } = useAnalyticsRefresh({ 
    onRefresh: refetch 
  });

  // Memoize content to prevent unnecessary re-renders
  const memoizedContent = useMemo(() => (
    <AnalyticsContent
      data={data}
      isLoading={isAnalyticsLoading}
      error={error}
      activeMetric={activeMetric}
      setActiveMetric={setActiveMetric}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      itemsPerPage={itemsPerPage}
      dateRange={dateRange}
      selectedCampaigns={selectedCampaigns}
      refetchAnalytics={refetch}
    />
  ), [data, isAnalyticsLoading, error, activeMetric, currentPage, itemsPerPage, dateRange, selectedCampaigns, refetch]);

  // --- Loading State for campaigns data ---
  if (isCampaignsLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-muted rounded" />
          <div className="flex justify-between gap-4">
            <div className="h-10 w-[300px] bg-muted rounded" />
            <div className="flex gap-4">
              <div className="h-10 w-[180px] bg-muted rounded" />
              <div className="h-10 w-36 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[500px] bg-muted rounded-lg" />
            <div className="h-[500px] bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // --- Render UI ---
  return (
    <div className="container relative">
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="space-y-8">
          {/* Header doesn't re-render when campaign selection changes */}
          <AnalyticsHeader
            selectedCampaigns={selectedCampaigns}
            onCampaignChange={handleCampaignChange}
            onResetCampaigns={handleResetCampaigns}
            allCampaigns={allCampaigns?.map(c => ({
              id: c._id,
              campaignName: c.campaignName
            })) || []}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={refreshAnalytics}
            isRefreshing={isRefreshing}
            campaignCount={allCampaigns?.length || 0}
            lastUpdatedAt={data?.lastUpdatedAt ? new Date(data.lastUpdatedAt).getTime() : null}
          />

          {/* Only this part re-renders when campaign selection changes */}
          {memoizedContent}
        </div>
      </div>
    </div>
  );
}