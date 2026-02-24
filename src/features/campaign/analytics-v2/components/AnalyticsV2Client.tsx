"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useCampaignAnalyticsV2 } from "../hooks/useCampaignAnalyticsV2";
import { useChartDataV2 } from "../hooks/useChartDataV2";
import { useVideoPerformanceV2 } from "../hooks/useVideoPerformanceV2";
import { AnalyticsV2Header } from "./AnalyticsV2Header";
import type { DateRangeFilter } from "./AnalyticsV2Header";
import { KPIMetricsV2 } from "./KPIMetricsV2";
import { MetricsChartV2 } from "./MetricsChartV2";
import { VideoPerformanceTableV2 } from "./VideoPerformanceTableV2";
import { AdvancedAnalyticsSection } from "./AdvancedAnalyticsSection";
import { CampaignInfoSection } from "./CampaignInfoSection";
import { CommentCurationSection, SelectedCommentsDisplay } from "../comments";
import { VideoSamplesSection } from "./VideoSamplesSection";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { staggerContainer } from "../constants/metrics-v2";
import type { MetricType, PlatformFilter } from "../types/analytics-v2.types";

type ChartMode = "area" | "bar" | "dailyGain";

function AnalyticsSkeleton({ platform }: { platform: PlatformFilter }) {
  const isInstagram = platform === "instagram";
  const kpiCount = isInstagram ? 4 : 6;
  const kpiGridCols = isInstagram
    ? "grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
    : "grid grid-cols-6 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3";

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
      {/* Campaign info skeleton */}
      <Card className="p-4 sm:p-6 border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </Card>

      {/* KPI cards skeleton */}
      <div className={kpiGridCols}>
        {Array.from({ length: kpiCount }).map((_, i) => (
          <Card
            key={i}
            className={`p-2.5 sm:p-4 space-y-2 sm:space-y-3 border border-primary/10 ${
              isInstagram ? "col-span-3 sm:col-span-1" :
              i < 2 ? "col-span-3 sm:col-span-1" :
              i < 5 ? "col-span-2 sm:col-span-1" :
              "col-span-3 sm:col-span-1"
            }`}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-5 sm:h-7 sm:w-7 rounded-full" />
            </div>
            <Skeleton className="h-5 sm:h-7 w-20" />
          </Card>
        ))}
      </div>

      {/* Chart + Table skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-7">
          <Card className="p-4 sm:p-6 border border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </Card>
        </div>
        <div className="lg:col-span-5">
          <Card className="p-4 sm:p-6 border border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-7 w-20" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Skeleton className="h-16 w-12 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const hasLoadedOnce = useRef(false);

  const platformCounts = useQuery(api.app.analyticsV2.getPlatformPostCounts, { campaignId });

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
    platform,
  });

  const { growthChartData, barChartData, dailyGainChartData } = useChartDataV2(
    campaignId,
    adjustedTotals,
    minViewsExcludedStats,
    dateRange,
    dailyStatsByDate,
    platform,
  );

  const videoPerformance = useVideoPerformanceV2({
    campaignId,
    dateFrom: dateRange?.from,
    dateTo: dateRange?.to,
    platform,
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

  // Show skeleton when loading after a platform/filter change (not initial load)
  const showSkeleton = isLoading && hasLoadedOnce.current;

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
        platform={platform}
        onPlatformChange={setPlatform}
        platformCounts={platformCounts ?? { tiktokPosts: 0, instagramPosts: 0 }}
      />

      {showSkeleton ? (
        <AnalyticsSkeleton platform={platform} />
      ) : (
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

          <KPIMetricsV2 totals={adjustedTotals} platform={platform} />

          {/* Side-by-side layout: 7/12 metrics, 5/12 content performance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-7">
              <MetricsChartV2
                chartData={chartData}
                activeMetric={activeMetric}
                onActiveMetricChange={setActiveMetric}
                chartMode={chartMode}
                onChartModeChange={setChartMode}
              />
            </div>

            <div className="lg:col-span-5">
              <VideoPerformanceTableV2
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
                platform={platform}
              />
            </div>
          </div>

          {/* Advanced Analytics Section */}
          <AdvancedAnalyticsSection campaignId={campaignId} />

          {/* Comments Section */}
          {isPublic ? (
            <SelectedCommentsDisplay campaignId={campaignId} />
          ) : (
            <CommentCurationSection campaignId={campaignId} />
          )}

          {/* Content Samples Section */}
          <VideoSamplesSection campaignId={campaignId} isPublic={isPublic} />
        </motion.div>
      )}
    </div>
  );
}
