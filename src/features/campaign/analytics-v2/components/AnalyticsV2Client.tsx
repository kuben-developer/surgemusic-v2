"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCampaignAnalyticsV2 } from "../hooks/useCampaignAnalyticsV2";
import { useChartDataV2 } from "../hooks/useChartDataV2";
import { useVideoPerformanceV2 } from "../hooks/useVideoPerformanceV2";
import { AnalyticsV2Header } from "./AnalyticsV2Header";
import type { DateRangeFilter } from "./AnalyticsV2Header";
import { KPIMetricsV2 } from "./KPIMetricsV2";
import { MetricsChartV2 } from "./MetricsChartV2";
import { VideoPerformanceTableV2 } from "./VideoPerformanceTableV2";
import { CampaignInfoSection } from "../../analytics/components/CampaignInfoSection";
import { CommentCurationSection, SelectedCommentsDisplay } from "../../analytics/comments";
import { VideoSamplesSection } from "../../analytics/components/VideoSamplesSection";
import { staggerContainer } from "../constants/metrics-v2";
import type { MetricType } from "../types/analytics-v2.types";

type ChartMode = "area" | "bar" | "dailyGain";

interface AnalyticsV2ClientProps {
  campaignId: string;
  hideBackButton?: boolean;
}

export function AnalyticsV2Client({
  campaignId,
  hideBackButton = false,
}: AnalyticsV2ClientProps) {
  const { userId } = useAuth();
  const isPublic = !userId;
  const [activeMetric, setActiveMetric] = useState<MetricType>("views");
  const [dateRange, setDateRange] = useState<DateRangeFilter | undefined>();
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const hasLoadedOnce = useRef(false);

  const handleDateRangeChange = useCallback((range: DateRangeFilter | undefined) => {
    setDateRange(range);
    // Auto-switch to bar chart when date filter applied, back to area when cleared
    setChartMode(range ? "bar" : "area");
  }, []);

  const {
    isLoading,
    campaignName,
    artist,
    song,
    adjustedTotals,
    minViewsExcludedStats,
    settings,
    postCountsByDate,
    dailyStatsByDate,
  } = useCampaignAnalyticsV2({
    campaignId,
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
  });

  const { growthChartData, barChartData, dailyGainChartData } = useChartDataV2(
    campaignId,
    adjustedTotals,
    minViewsExcludedStats,
    dateRange,
    dailyStatsByDate,
  );

  const videoPerformance = useVideoPerformanceV2({
    campaignId,
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
  });

  // Track first successful load
  if (!isLoading) {
    hasLoadedOnce.current = true;
  }

  // Only show full-page spinner on initial load, not on filter changes
  if (isLoading && !hasLoadedOnce.current) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Build campaign metadata for the info section
  const campaignMetadata = {
    campaignId,
    name: campaignName,
    artist,
    song,
  };

  // Totals in the format CampaignInfoSection expects
  const totals = {
    posts: adjustedTotals.totalPosts,
    manualPosts: 0, // V2 doesn't track manual/api split in aggregates
    apiPosts: adjustedTotals.totalPosts,
    views: adjustedTotals.totalViews,
    likes: adjustedTotals.totalLikes,
    comments: adjustedTotals.totalComments,
    shares: adjustedTotals.totalShares,
    saves: adjustedTotals.totalSaves,
  };

  const chartData =
    chartMode === "bar"
      ? barChartData
      : chartMode === "dailyGain"
        ? dailyGainChartData
        : growthChartData;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      <AnalyticsV2Header
        campaignId={campaignId}
        postCountsByDate={postCountsByDate}
        settings={settings}
        isPublic={isPublic}
        hideBackButton={hideBackButton}
        onDateRangeChange={handleDateRangeChange}
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4 sm:space-y-6"
      >
        <CampaignInfoSection
          campaignMetadata={campaignMetadata}
          totals={totals}
          currencySymbol={settings.currencySymbol}
          manualCpmMultiplier={settings.manualCpmMultiplier}
          apiCpmMultiplier={settings.apiCpmMultiplier}
        />

        <KPIMetricsV2 totals={adjustedTotals} />

        {/* Side-by-side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MetricsChartV2
            chartData={chartData}
            activeMetric={activeMetric}
            onActiveMetricChange={setActiveMetric}
            chartMode={chartMode}
            onChartModeChange={setChartMode}
          />

          <VideoPerformanceTableV2
            videos={videoPerformance.videos}
            snapshotsMap={videoPerformance.snapshotsMap}
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
