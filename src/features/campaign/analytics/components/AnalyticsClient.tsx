"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCampaignAnalytics } from "../hooks/useCampaignAnalytics";
import { useVideoPerformance } from "../hooks/useVideoPerformance";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { CampaignInfoSection } from "./CampaignInfoSection";
import { KPIMetrics } from "./KPIMetrics";
import { MetricsChart } from "./MetricsChart";
import { VideoPerformanceTable } from "./VideoPerformanceTable";
import { staggerContainer } from "../constants/metrics";
import type { MetricType } from "../types/analytics.types";

interface AnalyticsClientProps {
  campaignId: string;
  hideBackButton?: boolean;
}

export function AnalyticsClient({ campaignId, hideBackButton = false }: AnalyticsClientProps) {
  const { userId } = useAuth();
  const isPublic = !userId;

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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <AnalyticsHeader
        campaignId={campaignId}
        dateFilter={dateFilter}
        postCountsByDate={postCountsByDate}
        lastUpdatedAt={analyticsData.lastUpdatedAt}
        onDateFilterChange={changeDateFilter}
        isPublic={isPublic}
        hideBackButton={hideBackButton}
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <CampaignInfoSection
          campaignMetadata={analyticsData.campaignMetadata}
          totals={analyticsData.totals}
        />

        <KPIMetrics data={kpiData} />

        {/* Side-by-side layout for Performance Metrics and Content Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          />
        </div>
      </motion.div>
    </div>
  );
}
