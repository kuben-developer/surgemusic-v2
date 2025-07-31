'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import { CommentsSection } from "@/components/analytics/CommentsSection";
import { Eye, Heart, MessageSquare, Share2 } from "lucide-react";
import type { MetricKey, MetricInfo, VideoMetric } from '@/components/analytics/types';
import type { AnalyticsData } from '../types/analytics.types';
import { fadeInUp, staggerContainer } from '../constants/metrics.constants';
import { calculateGrowth } from '../utils/analytics.utils';

// Metric info for consistent styling and icons
const metricInfo: Record<MetricKey, MetricInfo> = {
  views: {
    label: "Views",
    icon: <Eye className="h-4 w-4" />,
    color: "#10B981",
    description: "Total number of content views"
  },
  likes: {
    label: "Likes",
    icon: <Heart className="h-4 w-4" />,
    color: "#F59E0B",
    description: "Engagement through likes"
  },
  comments: {
    label: "Comments",
    icon: <MessageSquare className="h-4 w-4" />,
    color: "#EF4444",
    description: "User feedback and comments"
  },
  shares: {
    label: "Shares",
    icon: <Share2 className="h-4 w-4" />,
    color: "#3B82F6",
    description: "Content redistribution"
  }
};

interface AnalyticsContentProps {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  dateRange: string;
  selectedCampaigns: string[];
  refetchAnalytics: () => Promise<void>;
}

export function AnalyticsContent({
  data,
  isLoading,
  error,
  activeMetric,
  setActiveMetric,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  dateRange,
  selectedCampaigns,
  refetchAnalytics
}: AnalyticsContentProps) {
  // --- Loading State ---
  if (isLoading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
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
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Analytics Temporarily Unavailable</h1>
        <p className="text-muted-foreground mb-4">
          {error.message || "Could not load analytics data at this time."}
        </p>
        <Button onClick={refetchAnalytics} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // --- No Data State ---
  if (!isLoading && !data) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">No Analytics Data</h1>
        <p className="text-muted-foreground mb-4">No data available for the selected criteria.</p>
      </div>
    );
  }

  // --- Data Processing ---
  const { 
    dailyData = [], 
    avgEngagementRate = "0", 
    campaigns = [], 
    videoMetrics = [], 
    totals = { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: 0 } 
  } = data ?? {};
  
  // Map videoMetrics to have the expected 'id' field
  const mappedVideoMetrics = videoMetrics.map((vm: VideoMetric) => ({
    ...vm,
    id: vm._id || vm.id || Math.random().toString(36).substr(2, 9),
    videoInfo: {
      ...vm.videoInfo,
      id: vm.videoInfo._id || vm.videoInfo.id || Math.random().toString(36).substr(2, 9),
      tiktokUrl: vm.videoInfo.tiktokUrl || '',
      createdAt: vm.videoInfo._creationTime ? new Date(vm.videoInfo._creationTime) : new Date(),
      campaign: {
        id: parseInt(vm.videoInfo.campaign?.id?.toString() || '0'),
        campaignName: vm.videoInfo.campaign?.campaignName || ''
      }
    }
  }));

  const viewsGrowth = calculateGrowth(dailyData, 'views');
  const likesGrowth = calculateGrowth(dailyData, 'likes');
  const commentsGrowth = calculateGrowth(dailyData, 'comments');
  const sharesGrowth = calculateGrowth(dailyData, 'shares');
  const engagementGrowth = calculateGrowth(dailyData, 'engagement');

  const campaignCount = campaigns.length;
  const totalVideos = totals.totalVideos;

  return (
    <motion.div className="space-y-8" initial="initial" animate="animate" variants={staggerContainer}>
      <motion.div variants={fadeInUp}>
        <KpiMetricsGrid
          campaignsCount={campaignCount}
          totalVideos={totalVideos}
          totals={totals}
          viewsGrowth={viewsGrowth}
          likesGrowth={likesGrowth}
          commentsGrowth={commentsGrowth}
          engagementGrowth={engagementGrowth}
          avgEngagementRate={avgEngagementRate}
        />
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <PerformanceChartCard
          dailyData={dailyData}
          totals={totals}
          activeMetric={activeMetric}
          setActiveMetric={setActiveMetric}
          metricInfo={metricInfo}
          dateRange={dateRange}
          viewsGrowth={viewsGrowth}
          likesGrowth={likesGrowth}
          commentsGrowth={commentsGrowth}
          sharesGrowth={sharesGrowth}
        />

        <TopContentCard
          videoMetrics={mappedVideoMetrics}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <CommentsSection 
          campaignIds={selectedCampaigns.length > 0 ? selectedCampaigns : campaigns.map((c: any) => c._id)}
        />
      </motion.div>
    </motion.div>
  );
}