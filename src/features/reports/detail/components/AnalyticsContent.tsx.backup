"use client";

import { motion } from "framer-motion";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import { CommentsSection } from "@/components/analytics/CommentsSection";
import type { MetricKey, ReportCampaign, VideoMetric, GrowthData } from "../../shared/types/report.types";
import { fadeInUp, metricInfo } from "../constants/analytics.constants";

interface AnalyticsContentProps {
    // Report data
    report: {
        name: string;
        campaigns: ReportCampaign[];
    };
    
    // Analytics data
    analyticsData: {
        dailyData: any[];
        avgEngagementRate: string;
        videoMetrics: VideoMetric[];
        hiddenVideoIds: string[];
        lastUpdatedAt?: string;
        totals: {
            views: number;
            likes: number;
            comments: number;
            shares: number;
        };
    };
    
    // Growth calculations
    growthData: {
        viewsGrowth: GrowthData;
        likesGrowth: GrowthData;
        commentsGrowth: GrowthData;
        sharesGrowth: GrowthData;
        engagementGrowth: GrowthData;
    };
    
    // State and handlers
    dateRange: string;
    activeMetric: MetricKey;
    currentPage: number;
    selectedCampaigns: string[];
    itemsPerPage: number;
    isRefreshing: boolean;
    
    // Event handlers
    onDateRangeChange: (value: string) => void;
    onCampaignChange: (campaignId: string, isChecked: boolean) => void;
    onResetCampaigns: () => void;
    onRefresh: () => void;
    onActiveMetricChange: (metric: MetricKey) => void;
    onPageChange: (page: number) => void;
}

export function AnalyticsContent({
    report,
    analyticsData,
    growthData,
    dateRange,
    activeMetric,
    currentPage,
    selectedCampaigns,
    itemsPerPage,
    isRefreshing,
    onDateRangeChange,
    onCampaignChange,
    onResetCampaigns,
    onRefresh,
    onActiveMetricChange,
    onPageChange,
}: AnalyticsContentProps) {
    const { 
        dailyData, 
        avgEngagementRate, 
        videoMetrics, 
        hiddenVideoIds, 
        lastUpdatedAt, 
        totals 
    } = analyticsData;
    
    const {
        viewsGrowth,
        likesGrowth,
        commentsGrowth,
        sharesGrowth,
        engagementGrowth,
    } = growthData;

    // Filter out hidden videos from videoMetrics for display
    const visibleVideoMetrics = videoMetrics.filter(
        (vm: VideoMetric) => !hiddenVideoIds.includes(vm.videoInfo.id)
    );

    const totalVideos = visibleVideoMetrics.length;
    const campaignCount = report.campaigns.length || 0;

    return (
        <>
            <AnalyticsHeader
                selectedCampaigns={selectedCampaigns}
                onCampaignChange={onCampaignChange}
                onResetCampaigns={onResetCampaigns}
                allCampaigns={report.campaigns.map((c: ReportCampaign) => ({
                    id: c.id,
                    campaignName: c.campaignName
                }))}
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
                campaignCount={campaignCount}
                reportName={report.name}
                lastUpdatedAt={lastUpdatedAt}
            />

            <KpiMetricsGrid
                totals={totals}
                totalVideos={totalVideos}
                avgEngagementRate={avgEngagementRate}
                campaignsCount={campaignCount}
                viewsGrowth={viewsGrowth.value}
                likesGrowth={likesGrowth.value}
                commentsGrowth={commentsGrowth.value}
                sharesGrowth={sharesGrowth.value}
                engagementGrowth={engagementGrowth.value}
            />

            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PerformanceChartCard
                    dailyData={dailyData}
                    totals={totals}
                    activeMetric={activeMetric}
                    setActiveMetric={onActiveMetricChange}
                    metricInfo={metricInfo}
                    dateRange={dateRange}
                    viewsGrowth={viewsGrowth.value}
                    likesGrowth={likesGrowth.value}
                    commentsGrowth={commentsGrowth.value}
                    sharesGrowth={sharesGrowth.value}
                />

                <TopContentCard
                    videoMetrics={visibleVideoMetrics}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                />
            </motion.div>

            {/* Comments Section */}
            <motion.div variants={fadeInUp}>
                <CommentsSection 
                    campaignIds={report.campaigns.map((c: ReportCampaign) => c.id)}
                />
            </motion.div>
        </>
    );
}