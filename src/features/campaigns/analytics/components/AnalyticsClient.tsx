"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id } from "../../../../../convex/_generated/dataModel"
import { KPIMetrics } from "./KPIMetrics"
import { MetricsChart } from "./MetricsChart"
import { VideoPerformanceTable } from "./VideoPerformanceTable"
import { useAnalyticsData } from "../hooks/useAnalyticsData"
import { fadeInUp, staggerContainer } from "../constants/metrics"

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
        calculateGrowth,
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

    // Extract data from analytics with proper defaults
    const totals = analyticsData?.totals || { views: 0, likes: 0, comments: 0, shares: 0 }
    const dailyData = analyticsData?.dailyData || []
    const avgEngagementRate = analyticsData?.avgEngagementRate || '0'
    const lastUpdatedAt = analyticsData?.lastUpdatedAt
    const videoMetrics = analyticsData?.videoMetrics || []

    // Calculate growth metrics
    const viewsGrowth = calculateGrowth(dailyData, 'views')
    const likesGrowth = calculateGrowth(dailyData, 'likes')
    const commentsGrowth = calculateGrowth(dailyData, 'comments')
    const sharesGrowth = calculateGrowth(dailyData, 'shares')
    const engagementGrowth = calculateGrowth(dailyData.map((day: any) => ({
        ...day,
        engagement: ((day.likes + day.comments + day.shares) / Math.max(day.views, 1)) * 100
    })), 'engagement')

    return (
        <div className="container max-w-7xl mx-auto py-12 px-4">
            {lastUpdatedAt && (
                <div className="flex mb-6 mr-1 items-center justify-end text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500/70 animate-pulse" />
                        Updated {new Date(lastUpdatedAt).toLocaleString()}
                    </span>
                </div>
            )}
            <motion.div
                className="space-y-8"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Navigation and controls */}
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Link href={`/campaign/${campaignId}`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Analytics Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={dateRange} onValueChange={handleDateRangeChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select date range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="15">Last 15 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="60">Last 60 days</SelectItem>
                                <SelectItem value="90">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={refreshAnalytics}
                            disabled={isRefreshing}
                            className="gap-2"
                        >
                            <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                            Refresh Analytics
                        </Button>
                    </div>
                </motion.div>

                {/* Campaign header */}
                <motion.section
                    variants={fadeInUp}
                    className="relative overflow-hidden rounded-2xl p-8 shadow-xl border border-primary/10"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
                    <div className="relative space-y-4">
                        <div className="flex flex-col gap-2">
                            <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/30 px-3 py-1">
                                Campaign Performance
                            </Badge>
                            <h2 className="text-3xl font-bold">{campaign.campaignName}</h2>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Created on {new Date(campaign._creationTime).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span>•</span>
                                <span>{generatedVideos?.length || 0} videos</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

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