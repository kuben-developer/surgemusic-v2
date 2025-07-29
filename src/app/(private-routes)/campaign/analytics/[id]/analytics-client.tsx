"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight, BarChart2, Calendar, ExternalLink, Eye, Heart, MessageCircle, MessageSquare, RefreshCcw, Share2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useQuery, useAction } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import type { Id, Doc } from "../../../../../../convex/_generated/dataModel"
import { useEffect } from "react"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

// Chart transition animation
const chartVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

// Metric info for consistent styling and icons
const metricInfo = {
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
}

export default function AnalyticsClient() {
    const params = useParams()
    const campaignId = params.id as string
    const [dateRange, setDateRange] = useState("30")
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [activeMetric, setActiveMetric] = useState('views')
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [analyticsData, setAnalyticsData] = useState<{
        aggregatedData: {
            platform: string;
            metrics: {
                views: number;
                likes: number;
                comments: number;
                shares: number;
            };
        }[];
        videoAnalytics: {
            videoId: string;
            videoName: string;
            platforms: {
                platform: string;
                postId: string;
                caption: string;
                postedAt: Date;
                metrics: {
                    views: number;
                    likes: number;
                    comments: number;
                    shares: number;
                };
                postUrl?: string;
            }[];
        }[];
        chartData: {
            date: string;
            views: number;
            likes: number;
            comments: number;
            shares: number;
        }[];
    } | null>(null)
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)

    const campaign = useQuery(api.campaigns.get, campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
    const isCampaignLoading = campaign === undefined

    const generatedVideos = useQuery(api.campaigns.getPostedVideos, campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
    const isVideosLoading = generatedVideos === undefined

    const getAnalytics = useAction(api.analytics.getAnalytics)

    // Fetch analytics data on mount and when dependencies change
    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!campaignId) return;
            setIsAnalyticsLoading(true);
            try {
                const data = await getAnalytics({
                    campaignId: campaignId as Id<"campaigns">,
                    days: parseInt(dateRange)
                });
                setAnalyticsData(data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setIsAnalyticsLoading(false);
            }
        };
        fetchAnalytics();
    }, [campaignId, dateRange, getAnalytics])

    // Function to handle date range changes
    const handleDateRangeChange = (value: string) => {
        setDateRange(value);
    };

    // Function to refresh analytics data
    const refreshAnalytics = async () => {
        setIsRefreshing(true);
        try {
            const data = await getAnalytics({
                campaignId: campaignId as Id<"campaigns">,
                days: parseInt(dateRange)
            });
            setAnalyticsData(data);
            toast.success("Latest analytics data has been loaded");
        } catch (error) {
            toast.error("Error refreshing analytics. Please try again later.");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Calculate growth percentages
    const calculateGrowth = (data: { [key: string]: number }[], metric: string) => {
        if (!data || data.length < 2) return { value: 0, isPositive: true };

        // Split data into two equal periods
        const halfPoint = Math.floor(data.length / 2);
        const firstHalf = data.slice(0, halfPoint);
        const secondHalf = data.slice(halfPoint);

        // Calculate totals for each half
        const firstHalfTotal = firstHalf.reduce((sum, day) => sum + (day[metric] || 0), 0);
        const secondHalfTotal = secondHalf.reduce((sum, day) => sum + (day[metric] || 0), 0);

        // Calculate growth percentage
        if (firstHalfTotal === 0) return { value: secondHalfTotal > 0 ? 100 : 0, isPositive: true };

        const growthPercent = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
        return {
            value: Math.abs(Math.round(growthPercent * 10) / 10), // Round to 1 decimal
            isPositive: growthPercent >= 0
        };
    };

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

    const { totals, dailyData, avgEngagementRate, lastUpdatedAt } = analyticsData;

    // Calculate growth metrics
    const viewsGrowth = calculateGrowth(dailyData, 'views');
    const likesGrowth = calculateGrowth(dailyData, 'likes');
    const commentsGrowth = calculateGrowth(dailyData, 'comments');
    const sharesGrowth = calculateGrowth(dailyData, 'shares');
    const engagementGrowth = calculateGrowth(dailyData.map((day) => ({
        ...day,
        engagement: ((day.likes + day.comments + day.shares) / Math.max(day.views, 1)) * 100
    })), 'engagement');

    return (
        <div className="container max-w-7xl mx-auto py-12 px-4">
            {lastUpdatedAt && <div className="flex mb-6 mr-1 items-center justify-end text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500/70 animate-pulse"></span>
                    Updated {new Date(lastUpdatedAt).toLocaleString()}
                </span>
            </div>}
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
                <motion.section
                    variants={fadeInUp}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
                >
                    <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Posts</h3>
                            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                                <BarChart2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{generatedVideos?.length || 0}</p>
                            <div className="flex items-center gap-1 text-xs">
                                {/* No growth metric for total posts */}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Views</h3>
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{totals.views.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                {viewsGrowth.value > 0 && (
                                    <>
                                        {viewsGrowth.isPositive ? (
                                            <ArrowUpRight className="h-3 w-3" />
                                        ) : (
                                            <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={viewsGrowth.isPositive ? "" : "text-red-600 dark:text-red-400"}>
                                            {viewsGrowth.value}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Likes</h3>
                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{totals.likes.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                {likesGrowth.value > 0 && (
                                    <>
                                        {likesGrowth.isPositive ? (
                                            <ArrowUpRight className="h-3 w-3" />
                                        ) : (
                                            <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={likesGrowth.isPositive ? "" : "text-red-600 dark:text-red-400"}>
                                            {likesGrowth.value}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Comments</h3>
                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{totals.comments.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-xs">
                                {commentsGrowth.value > 0 && (
                                    <>
                                        {commentsGrowth.isPositive ? (
                                            <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={commentsGrowth.isPositive ?
                                            "text-green-600 dark:text-green-400" :
                                            "text-red-600 dark:text-red-400"}>
                                            {commentsGrowth.value}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Shares</h3>
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{totals.shares.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-xs">
                                {sharesGrowth.value > 0 && (
                                    <>
                                        {sharesGrowth.isPositive ? (
                                            <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={sharesGrowth.isPositive ?
                                            "text-green-600 dark:text-green-400" :
                                            "text-red-600 dark:text-red-400"}>
                                            {sharesGrowth.value}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Eng. Rate</h3>
                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{avgEngagementRate}%</p>
                            <div className="flex items-center gap-1 text-xs">
                                {engagementGrowth.value > 0 && (
                                    <>
                                        {engagementGrowth.isPositive ? (
                                            <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={engagementGrowth.isPositive ?
                                            "text-green-600 dark:text-green-400" :
                                            "text-red-600 dark:text-red-400"}>
                                            {engagementGrowth.value}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                </motion.section>

                {/* Charts Section */}
                <motion.div
                    variants={fadeInUp}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Tabbed Metrics Chart */}
                    <Card className="p-6 border border-primary/10 shadow-md overflow-hidden">
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                                <Badge variant="outline" className="bg-primary/5 text-primary">
                                    {dateRange} Day Trend
                                </Badge>
                            </div>

                            {/* Metric Info Display */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${metricInfo[activeMetric as keyof typeof metricInfo].color}20` }}>
                                    <div className="flex items-center justify-center h-6 w-6 text-primary" style={{ color: metricInfo[activeMetric as keyof typeof metricInfo].color }}>
                                        {metricInfo[activeMetric as keyof typeof metricInfo].icon}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium">{metricInfo[activeMetric as keyof typeof metricInfo].label}</h4>
                                    <p className="text-xs text-muted-foreground">{metricInfo[activeMetric as keyof typeof metricInfo].description}</p>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex mb-4 bg-muted/50 rounded-lg p-1 backdrop-blur-sm">
                                {Object.keys(metricInfo).map((metric) => (
                                    <button
                                        key={metric}
                                        className={cn(
                                            "flex-1 py-2 px-3 text-sm rounded-md transition-all relative overflow-hidden",
                                            activeMetric === metric
                                                ? "text-white font-medium"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                        onClick={() => setActiveMetric(metric)}
                                    >
                                        {activeMetric === metric && (
                                            <motion.div
                                                className="absolute inset-0 rounded-md -z-10"
                                                layoutId="activeTab"
                                                style={{ backgroundColor: metricInfo[metric as keyof typeof metricInfo].color }}
                                                initial={false}
                                            />
                                        )}
                                        <div className="flex items-center justify-center gap-2">
                                            {metricInfo[metric as keyof typeof metricInfo].icon}
                                            <span>{metricInfo[metric as keyof typeof metricInfo].label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart */}
                        <motion.div
                            className="h-80 bg-white dark:bg-muted/30 rounded-lg p-4 border border-border/30 shadow-sm"
                            key={activeMetric}
                            variants={chartVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyData}>
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor={metricInfo[activeMetric as keyof typeof metricInfo].color}
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={metricInfo[activeMetric as keyof typeof metricInfo].color}
                                                stopOpacity={0.2}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700 stroke-gray-200" opacity={0.3} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        className="dark:fill-gray-400 fill-gray-500"
                                        tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 12 }}
                                        axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        className="dark:fill-gray-400 fill-gray-500"
                                        tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 12 }}
                                        axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
                                        tickLine={false}
                                        width={40}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            padding: '8px 12px',
                                            color: 'var(--foreground)'
                                        }}
                                        labelStyle={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: '4px' }}
                                        itemStyle={{ color: 'var(--foreground)', fontSize: 14 }}
                                        formatter={(value) => [value.toLocaleString(), metricInfo[activeMetric as keyof typeof metricInfo].label]}
                                        labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey={activeMetric}
                                        stroke={metricInfo[activeMetric as keyof typeof metricInfo].color}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorGradient)"
                                        activeDot={{
                                            r: 6,
                                            stroke: metricInfo[activeMetric as keyof typeof metricInfo].color,
                                            strokeWidth: 2,
                                            fill: 'var(--background)'
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Summary Stats */}
                        <div className="mt-4 grid grid-cols-3 gap-4">
                            <div className="rounded-lg bg-muted/30 p-3">
                                <div className="text-xs text-muted-foreground mb-1">Total</div>
                                <div className="text-lg font-semibold">{totals[activeMetric as keyof typeof totals].toLocaleString()}</div>
                            </div>
                            <div className="rounded-lg bg-muted/30 p-3">
                                <div className="text-xs text-muted-foreground mb-1">Average</div>
                                <div className="text-lg font-semibold">
                                    {Math.round(
                                        dailyData.reduce((sum: number, day) => sum + (day[activeMetric as keyof typeof day] as number), 0) /
                                        (dailyData.length || 1)
                                    ).toLocaleString()}
                                </div>
                            </div>
                            <div className="rounded-lg bg-muted/30 p-3">
                                <div className="text-xs text-muted-foreground mb-1">Trend</div>
                                <div className="flex items-center gap-1">
                                    {(() => {
                                        // Get the growth data for active metric
                                        let growth;
                                        switch (activeMetric) {
                                            case 'views': growth = viewsGrowth; break;
                                            case 'likes': growth = likesGrowth; break;
                                            case 'comments': growth = commentsGrowth; break;
                                            case 'shares': growth = sharesGrowth; break;
                                            default: growth = { value: 0, isPositive: true };
                                        }

                                        if (growth.value === 0) {
                                            return <span className="text-lg font-semibold">--</span>;
                                        }

                                        return (
                                            <>
                                                {growth.isPositive ? (
                                                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 rotate-180 text-red-500" />
                                                )}
                                                <span className={`text-lg font-semibold ${growth.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {growth.isPositive ? '+' : '-'}{growth.value}%
                                                </span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </Card>


                    {/* Content Performance */}
                    <Card className="p-6 border border-primary/10">
                        <div className="mb-6 space-y-2">
                            <h3 className="text-lg font-semibold">Content Performance</h3>
                            <p className="text-sm text-muted-foreground">All videos sorted by highest views</p>
                        </div>

                        {/* Pagination controls */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-muted-foreground">
                                {generatedVideos && generatedVideos.length > 0 ? (
                                    `Showing ${Math.min(currentPage * itemsPerPage + 1, generatedVideos.length)} - ${Math.min((currentPage + 1) * itemsPerPage, generatedVideos.length)} of ${generatedVideos.length} videos`
                                ) : (
                                    "No videos found"
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 0}
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!generatedVideos || currentPage >= Math.ceil(generatedVideos.length / itemsPerPage) - 1}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-auto space-y-4">
                            {generatedVideos && generatedVideos.length > 0 ? (
                                generatedVideos
                                    // Map videos with their analytics data
                                    .map((video) => {
                                        const videoMetric = analyticsData.videoMetrics.find((m) => m.id === (video.tiktokUpload?.post?.id || video.instagramUpload?.post?.id || video.youtubeUpload?.post?.id)) || {
                                            views: 0,
                                            likes: 0,
                                            comments: 0,
                                            shares: 0
                                        };
                                        return {
                                            ...video,
                                            views: videoMetric.views,
                                            likes: videoMetric.likes,
                                            comments: videoMetric.comments,
                                            shares: videoMetric.shares
                                        };
                                    })
                                    // Sort by views (highest first)
                                    .sort((a, b) => b.views - a.views)
                                    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                                    .map((video, index) => (
                                        <div
                                            key={video._id}
                                            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="relative h-16 aspect-[9/16] rounded overflow-hidden bg-muted">
                                                <video src={video.video.url} className="h-full w-full object-cover" />
                                                {/* <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <Badge variant="secondary" className="bg-background/70">
                                                        {currentPage * itemsPerPage + index + 1}
                                                    </Badge>
                                                </div> */}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{video.video.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-muted-foreground">
                                                        {video.video.type} • Posted {new Date(video._creationTime).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    {video.tiktokUpload?.post?.url && (
                                                        <a
                                                            href={video.tiktokUpload.post.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            Open on TikTok
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{video.views.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{video.likes.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{video.shares.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{video.comments.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p>No videos found for this campaign</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    )
} 