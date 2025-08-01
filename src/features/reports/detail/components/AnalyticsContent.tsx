"use client";

import { motion } from "framer-motion";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { CommentsSection } from "@/components/analytics/CommentsSection";
import { AnalyticsChartsSection } from "./AnalyticsChartsSection";
import { fadeInUp, metricInfo } from "../constants/analytics.constants";
import type { 
    AnalyticsContentReport,
    AnalyticsContentData,
    AnalyticsContentGrowth,
    AnalyticsContentState,
    AnalyticsContentHandlers 
} from "../types/analytics-content.types";

interface ProcessedAnalyticsData {
    totalVideos: number;
    campaignCount: number;
    transformedCampaigns: Array<{ id: string; campaignName: string }>;
    campaignIds: string[];
}

interface AnalyticsContentProps {
    report: AnalyticsContentReport;
    analyticsData: AnalyticsContentData;
    growthData: AnalyticsContentGrowth;
    processedData: ProcessedAnalyticsData;
    state: AnalyticsContentState;
    handlers: AnalyticsContentHandlers;
}

export function AnalyticsContent({
    report,
    analyticsData,
    growthData,
    processedData,
    state,
    handlers,
}: AnalyticsContentProps) {
    const { totals, avgEngagementRate, lastUpdatedAt } = analyticsData;
    const { viewsGrowth, likesGrowth, commentsGrowth, sharesGrowth, engagementGrowth } = growthData;
    const { 
        dateRange, 
        activeMetric, 
        currentPage, 
        selectedCampaigns, 
        itemsPerPage, 
        isRefreshing 
    } = state;
    const {
        onDateRangeChange,
        onCampaignChange,
        onResetCampaigns,
        onRefresh,
        onActiveMetricChange,
        onPageChange,
    } = handlers;

    const {
        totalVideos,
        campaignCount,
        transformedCampaigns,
        campaignIds,
    } = processedData;

    return (
        <>
            <AnalyticsHeader
                selectedCampaigns={selectedCampaigns}
                onCampaignChange={onCampaignChange}
                onResetCampaigns={onResetCampaigns}
                allCampaigns={transformedCampaigns}
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

            <AnalyticsChartsSection
                data={analyticsData}
                growth={growthData}
                state={{ activeMetric, currentPage, itemsPerPage, dateRange }}
                handlers={{ onActiveMetricChange, onPageChange }}
                metricInfo={metricInfo}
            />

            <motion.div variants={fadeInUp}>
                <CommentsSection campaignIds={campaignIds} />
            </motion.div>
        </>
    );
}