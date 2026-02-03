"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useCampaignAnalytics } from "../hooks/useCampaignAnalytics";
import { useVideoPerformance } from "../hooks/useVideoPerformance";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { CampaignInfoSection } from "./CampaignInfoSection";
import { KPIMetrics } from "./KPIMetrics";
import { MetricsChart } from "./MetricsChart";
import { VideoPerformanceTable } from "./VideoPerformanceTable";
import { VideoSamplesSection } from "./VideoSamplesSection";
import { CommentCurationSection, SelectedCommentsDisplay } from "../comments";
import { staggerContainer } from "../constants/metrics";
import type { MetricType } from "../types/analytics.types";
import type { AnalyticsSettingsValues } from "./AnalyticsSettings";

interface AnalyticsClientProps {
  campaignId: string;
  hideBackButton?: boolean;
}

export function AnalyticsClient({ campaignId, hideBackButton = false }: AnalyticsClientProps) {
  const { userId } = useAuth();
  const isPublic = !userId;

  // Fetch campaign analytics settings
  const settingsData = useQuery(api.app.analytics.getCampaignAnalyticsSettings, { campaignId });

  // Local state for optimistic updates
  const [localSettings, setLocalSettings] = useState<AnalyticsSettingsValues | null>(null);

  // Use local settings if available, otherwise use fetched settings
  const currentSettings = localSettings ?? settingsData ?? {
    minViewsFilter: 0,
    currencySymbol: "USD" as const,
    manualCpmMultiplier: 1,
    apiCpmMultiplier: 0.5,
  };

  const handleSettingsChange = useCallback((newSettings: AnalyticsSettingsValues) => {
    setLocalSettings(newSettings);
  }, []);

  const {
    analyticsData,
    postCountsByDate,
    postDatesFilter,
    isLoading,
    error,
    dateFilter,
    changeDateFilter,
  } = useCampaignAnalytics(campaignId);

  // Video performance with pagination and filtering
  const videoPerformance = useVideoPerformance({
    campaignId,
    dates: postDatesFilter,
  });

  const [activeMetric, setActiveMetric] = useState<MetricType>("views");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive mb-2">Error Loading Analytics</p>
          <p className="text-sm text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  // Prepare KPI data (simplified - no growth metrics)
  const kpiData = {
    totals: analyticsData.totals,
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      <AnalyticsHeader
        campaignId={campaignId}
        dateFilter={dateFilter}
        postCountsByDate={postCountsByDate}
        lastUpdatedAt={analyticsData.lastUpdatedAt}
        onDateFilterChange={changeDateFilter}
        isPublic={isPublic}
        hideBackButton={hideBackButton}
        minViewsFilter={currentSettings.minViewsFilter}
        currencySymbol={currentSettings.currencySymbol}
        manualCpmMultiplier={currentSettings.manualCpmMultiplier}
        apiCpmMultiplier={currentSettings.apiCpmMultiplier}
        onSettingsChange={handleSettingsChange}
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4 sm:space-y-6"
      >
        <CampaignInfoSection
          campaignMetadata={analyticsData.campaignMetadata}
          totals={analyticsData.totals}
          currencySymbol={currentSettings.currencySymbol}
          manualCpmMultiplier={currentSettings.manualCpmMultiplier}
          apiCpmMultiplier={currentSettings.apiCpmMultiplier}
        />

        <KPIMetrics data={kpiData} />

        {/* Side-by-side layout for Performance Metrics and Content Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MetricsChart
            dailyData={analyticsData.dailyData}
            activeMetric={activeMetric}
            onActiveMetricChange={setActiveMetric}
          />

          <VideoPerformanceTable
            videos={videoPerformance.videos}
            currentPage={videoPerformance.currentPage}
            totalPages={videoPerformance.totalPages}
            totalCount={videoPerformance.totalCount}
            itemsPerPage={videoPerformance.itemsPerPage}
            onPageChange={videoPerformance.goToPage}
            viewsFilter={videoPerformance.viewsFilter}
            onViewsFilterChange={videoPerformance.updateViewsFilter}
            onClearFilters={videoPerformance.clearFilters}
            hasActiveFilters={videoPerformance.hasActiveFilters}
            sortOrder={videoPerformance.sortOrder}
            onToggleSortOrder={videoPerformance.toggleSortOrder}
            isLoading={videoPerformance.isLoading}
            isPublic={isPublic}
          />
        </div>

        {/* Comments Section */}
        {isPublic ? (
          <SelectedCommentsDisplay campaignId={campaignId} />
        ) : (
          <CommentCurationSection campaignId={campaignId} />
        )}

        {/* Content Samples Section */}
        <VideoSamplesSection campaignId={campaignId} isPublic={isPublic} />
      </motion.div>
    </div>
  );
}
