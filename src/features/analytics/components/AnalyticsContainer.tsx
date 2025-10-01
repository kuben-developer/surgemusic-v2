"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAnalytics } from "../hooks/useAnalytics";
import { useComments } from "../hooks/useComments";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import { CommentsSection as OriginalCommentsSection } from "@/components/analytics/CommentsSection";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import type { AnalyticsContainerProps } from "../types/analytics.types";
import type { MetricKey, MetricInfo } from "@/types/analytics.types";

export function AnalyticsContainer({
  type,
  entityId,
  title,
  showCampaignSelector = false,
  showCommentsSection = true,
  showExportButton = false,
}: AnalyticsContainerProps) {
  // Pagination state for videos - MUST be before any conditional returns
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Fetch analytics data
  const analytics = useAnalytics({ 
    type, 
    entityId,
    initialDateRange: 30
  });

  // Fetch comments if needed
  const comments = useComments({
    campaignIds: type === 'campaign' && entityId ? [entityId] : 
                 analytics.data?.campaigns.map(c => c.id) || []
  });

  // Memoize campaign IDs for comments
  const campaignIdsForComments = useMemo(() => {
    if (type === 'campaign' && entityId) return [entityId];
    if (analytics.selectedCampaigns.length > 0) return analytics.selectedCampaigns;
    return analytics.data?.campaigns.map(c => c.id) || [];
  }, [type, entityId, analytics.selectedCampaigns, analytics.data]);

  // Transform video metrics to match the original format - compute even if data not ready yet
  const transformedVideoMetrics = useMemo(() => {
    if (!analytics.data) return [];
    return analytics.data.videoMetrics.map((video, index) => ({
    id: video.videoId,
    views: video.metrics.views,
    likes: video.metrics.likes,
    comments: video.metrics.comments,
    shares: video.metrics.shares,
    engagement: video.metrics.likes + video.metrics.comments + video.metrics.shares,
    engagementRate: video.metrics.views > 0 
      ? ((video.metrics.likes + video.metrics.comments + video.metrics.shares) / video.metrics.views * 100).toFixed(2)
      : "0.00",
    videoInfo: {
      id: video.videoId,
      postId: null,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl, // Add thumbnail URL
      videoName: `Video ${video.videoId.slice(-6)}`,
      videoType: "video/mp4",
      createdAt: video.postedAt < 10000000000 
        ? new Date(video.postedAt * 1000)  // Convert seconds to milliseconds
        : new Date(video.postedAt),
      tiktokUrl: video.platform === "tiktok" ? video.videoUrl : "",
      campaign: {
        id: index, // Use index as a number ID since the original expects a number
        campaignName: video.campaignName,
      },
    },
    }));
  }, [analytics.data]);

  // Prepare metric info for the chart
  const metricInfo: Record<MetricKey, MetricInfo> = {
    views: { 
      label: "Views", 
      color: "#3B82F6",
      icon: null,
      description: "Total views"
    },
    likes: { 
      label: "Likes", 
      color: "#EF4444",
      icon: null,
      description: "Total likes"
    },
    comments: { 
      label: "Comments", 
      color: "#10B981",
      icon: null,
      description: "Total comments"
    },
    shares: { 
      label: "Shares", 
      color: "#F59E0B",
      icon: null,
      description: "Total shares"
    },
  };

  // Loading state
  if (analytics.isLoading && !analytics.data) {
    return <LoadingState />;
  }

  // Error state
  if (analytics.error) {
    return <ErrorState error={analytics.error} onRetry={analytics.refresh} />;
  }

  // No data state
  if (!analytics.data) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Analytics Data</h2>
          <p className="text-muted-foreground">
            No analytics data available for the selected period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative">
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="space-y-8">
          {/* Header */}
          {showCampaignSelector ? (
            <AnalyticsHeader
              selectedCampaigns={analytics.selectedCampaigns}
              onCampaignChange={(campaignId: string, isChecked: boolean) => {
                if (isChecked) {
                  analytics.setSelectedCampaigns([...analytics.selectedCampaigns, campaignId]);
                } else {
                  analytics.setSelectedCampaigns(analytics.selectedCampaigns.filter(id => id !== campaignId));
                }
              }}
              onResetCampaigns={() => analytics.setSelectedCampaigns([])}
              allCampaigns={analytics.allCampaigns?.map(c => ({
                id: c._id,
                campaignName: c.campaignName,
                createdAt: c._creationTime
              }))}
              dateRange={String(analytics.dateRange)}
              onDateRangeChange={(range: string) => analytics.setDateRange(Number(range))}
              onRefresh={analytics.refresh}
              isRefreshing={analytics.isRefreshing}
              campaignCount={analytics.data.campaigns.length}
              lastUpdatedAt={analytics.data.metadata.lastUpdatedAt}
            />
          ) : (
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{title}</h1>
              <div className="flex items-center gap-4">
                <select 
                  value={analytics.dateRange} 
                  onChange={(e) => analytics.setDateRange(Number(e.target.value))}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <button 
                  onClick={analytics.refresh}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  disabled={analytics.isRefreshing}
                >
                  {analytics.isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          )}

          {/* KPI Metrics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <KpiMetricsGrid
              campaignsCount={analytics.data.campaigns.length}
              totalVideos={analytics.data.metadata.totalVideos}
              totals={{
                views: analytics.data.metrics.views,
                likes: analytics.data.metrics.likes,
                comments: analytics.data.metrics.comments,
                shares: analytics.data.metrics.shares,
              }}
              viewsGrowth={analytics.growth?.views || { value: 0, isPositive: true }}
              likesGrowth={analytics.growth?.likes || { value: 0, isPositive: true }}
              commentsGrowth={analytics.growth?.comments || { value: 0, isPositive: true }}
              sharesGrowth={analytics.growth?.shares || { value: 0, isPositive: true }}
              engagementGrowth={analytics.growth?.engagement || { value: 0, isPositive: true }}
              avgEngagementRate={analytics.formattedEngagementRate}
            />
          </motion.div>

          {/* Charts and Top Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <PerformanceChartCard
              dailyData={analytics.data.dailyMetrics.map(day => ({
                date: day.date,
                views: day.views,
                likes: day.likes,
                comments: day.comments,
                shares: day.shares,
              }))}
              totals={{
                views: analytics.data.metrics.views,
                likes: analytics.data.metrics.likes,
                comments: analytics.data.metrics.comments,
                shares: analytics.data.metrics.shares,
                totalVideos: analytics.data.metadata.totalVideos,
              }}
              activeMetric={analytics.activeMetric as MetricKey}
              setActiveMetric={(metric: MetricKey) => analytics.setActiveMetric(metric)}
              metricInfo={metricInfo}
              dateRange={String(analytics.dateRange)}
              viewsGrowth={analytics.growth?.views || { value: 0, isPositive: true }}
              likesGrowth={analytics.growth?.likes || { value: 0, isPositive: true }}
              commentsGrowth={analytics.growth?.comments || { value: 0, isPositive: true }}
              sharesGrowth={analytics.growth?.shares || { value: 0, isPositive: true }}
            />

            <TopContentCard
              videoMetrics={transformedVideoMetrics}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              hiddenVideoIds={analytics.data.metadata.hiddenVideoIds}
            />
          </motion.div>

          {/* Comments Section */}
          {showCommentsSection && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <OriginalCommentsSection 
                campaignIds={campaignIdsForComments} 
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}