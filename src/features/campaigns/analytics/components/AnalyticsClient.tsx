"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { KPIMetrics } from "./KPIMetrics";
import { MetricsChart } from "./MetricsChart";
import { VideoPerformanceTable } from "./VideoPerformanceTable";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { CampaignInfoSection } from "./CampaignInfoSection";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { fadeInUp, staggerContainer } from "../constants/metrics";
import { processAnalyticsData } from "../utils/analytics-calculations";
import { calculateGrowth } from "@/utils/analytics/growth-calculations.utils";

export default function AnalyticsClient() {
    const params = useParams()
    const campaignId = params.id as string
    const [activeMetric, setActiveMetric] = useState('views')
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage] = useState(5)
    
    const campaign = useQuery(api.campaigns.get, campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
    const isCampaignLoading = campaign === undefined

    const generatedVideos = useQuery(api.campaigns.getPostedVideos, campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip")

    const {
        dateRange,
        isRefreshing,
        analyticsData,
        isAnalyticsLoading,
        handleDateRangeChange,
        refreshAnalytics,
    } = useAnalyticsData({ campaignId })

    if (isCampaignLoading || isAnalyticsLoading) {
        return (
            <div className="container max-w-7xl mx-auto py-12">
                <div className="space-y-8">
                    <section className="bg-card rounded-xl p-8 shadow-sm border">
                        <div className="space-y-6">
                            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-24 w-full bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )
    }

    if (!campaign || !analyticsData) {
        return (
            <div className="container max-w-7xl mx-auto py-12">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Campaign not found</h1>
                    <p className="text-muted-foreground mt-2">The campaign you're looking for doesn't exist or you don't have access to it.</p>
                </div>
            </div>
        )
    }

    // Process analytics data with defaults
    const {
        totals,
        dailyData,
        avgEngagementRate,
        lastUpdatedAt,
        videoMetrics
    } = processAnalyticsData(analyticsData);

    // Calculate growth metrics using the imported function
    const viewsGrowth = calculateGrowth(dailyData, 'views');
    const likesGrowth = calculateGrowth(dailyData, 'likes');
    const commentsGrowth = calculateGrowth(dailyData, 'comments');
    const sharesGrowth = calculateGrowth(dailyData, 'shares');
    const engagementGrowth = calculateGrowth(dailyData, 'engagement');

    return (
        <div className="container max-w-7xl mx-auto py-12 px-4">
            <motion.div
                className="space-y-8"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Navigation and controls */}
                <AnalyticsHeader
                    campaignId={campaignId}
                    dateRange={dateRange}
                    isRefreshing={isRefreshing}
                    lastUpdatedAt={lastUpdatedAt ?? undefined}
                    onDateRangeChange={handleDateRangeChange}
                    onRefresh={refreshAnalytics}
                />

                {/* Campaign header */}
                <CampaignInfoSection
                    campaign={campaign}
                    generatedVideosCount={generatedVideos?.length || 0}
                />

                {/* KPI Metrics */}
                <KPIMetrics
                    totals={totals}
                    avgEngagementRate={avgEngagementRate}
                    generatedVideos={generatedVideos}
                    viewsGrowth={viewsGrowth}
                    likesGrowth={likesGrowth}
                    commentsGrowth={commentsGrowth}
                    sharesGrowth={sharesGrowth}
                    engagementGrowth={engagementGrowth}
                />

                {/* Charts Section */}
                <motion.div
                    variants={fadeInUp}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Tabbed Metrics Chart */}
                    <MetricsChart
                        dailyData={dailyData}
                        totals={totals}
                        dateRange={dateRange}
                        activeMetric={activeMetric}
                        onActiveMetricChange={setActiveMetric}
                        viewsGrowth={viewsGrowth}
                        likesGrowth={likesGrowth}
                        commentsGrowth={commentsGrowth}
                        sharesGrowth={sharesGrowth}
                    />

                    {/* Content Performance */}
                    <VideoPerformanceTable
                        generatedVideos={generatedVideos}
                        videoMetrics={videoMetrics}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </motion.div>
            </motion.div>
        </div>
    )
}