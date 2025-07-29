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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import { motion } from "framer-motion"
import {
    Eye,
    Heart,
    MessageSquare,
    Share2,
} from "lucide-react"
import { useState, useMemo } from "react"
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader"
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid"
import { PerformanceChartCard, MetricKey, MetricInfo, DailyData, Totals } from "@/components/analytics/PerformanceChartCard"
import { TopContentCard } from "@/components/analytics/TopContentCard"
import { GrowthData } from "@/components/analytics/KpiCard"
import { CommentsSection } from "@/components/analytics/CommentsSection"

// Define the types for our analytics data
interface Campaign {
    id: string;
    campaignName: string;
}

interface VideoInfo {
    id: string;
    postId: string | null;
    videoUrl: string;
    videoName: string;
    videoType: string;
    createdAt: Date;
    campaign: Campaign;
}

interface VideoMetric {
    id: string;
    videoInfo: VideoInfo;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: string;
}

// Combined analytics data structure (Reflects API response shape)
// Note: Totals are calculated client-side, not part of the API response type
// interface ApiAnalyticsData {
//     dailyData: DailyData[];
//     videoMetrics: VideoMetric[];
//     avgEngagementRate: string;
//     campaigns: Campaign[];
// }

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
}

// Helper function to calculate growth percentages
const calculateGrowth = (data: DailyData[], metric: MetricKey | 'engagement'): GrowthData => {
    if (!data || data.length < 2) return { value: 0, isPositive: true };

    const halfPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, halfPoint);
    const secondHalf = data.slice(halfPoint);

    const calculateTotal = (arr: DailyData[]) => arr.reduce((sum, day) => {
        if (metric === 'engagement') {
            const dailyEng = ((day.likes + day.comments + day.shares) / Math.max(day.views, 1)) * 100;
            return sum + (isNaN(dailyEng) ? 0 : dailyEng);
        } else {
            return sum + (day[metric as MetricKey] || 0);
        }
    }, 0);

    const firstHalfTotal = calculateTotal(firstHalf);
    const secondHalfTotal = calculateTotal(secondHalf);

    if (metric === 'engagement') {
        const firstHalfAvg = firstHalf.length > 0 ? firstHalfTotal / firstHalf.length : 0;
        const secondHalfAvg = secondHalf.length > 0 ? secondHalfTotal / secondHalf.length : 0;
        if (firstHalfAvg === 0) return { value: secondHalfAvg > 0 ? 100 : 0, isPositive: true };
        const growthPercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        return {
            value: Math.abs(Math.round(growthPercent * 10) / 10),
            isPositive: growthPercent >= 0
        };
    } else {
        if (firstHalfTotal === 0) return { value: secondHalfTotal > 0 ? 100 : 0, isPositive: true };
        const growthPercent = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
        return {
            value: Math.abs(Math.round(growthPercent * 10) / 10),
            isPositive: growthPercent >= 0
        };
    }
};

// Separated data content component to prevent header re-renders
const AnalyticsContent = ({
    selectedCampaigns,
    dateRange,
    setCurrentPage,
    activeMetric,
    setActiveMetric,
    currentPage,
    itemsPerPage,
    refetchAnalytics
}: {
    selectedCampaigns: string[];
    dateRange: string;
    setCurrentPage: (page: number) => void;
    activeMetric: MetricKey;
    setActiveMetric: (metric: MetricKey) => void;
    currentPage: number;
    itemsPerPage: number;
    refetchAnalytics: ReturnType<typeof api.campaign.getCombinedAnalytics.useQuery>['refetch'];
}) => {
    // Use inferred type from tRPC query for analyticsData
    const { data: analyticsData, isLoading: isAnalyticsLoading, error: analyticsError } = api.campaign.getCombinedAnalytics.useQuery(
        {
            campaignIds: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
            days: parseInt(dateRange)
        }
        , {
            refetchOnWindowFocus: false,

        }
    );

    // --- Loading State ---
    if (isAnalyticsLoading && !analyticsData) {
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
    if (analyticsError) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-2">Analytics Temporarily Unavailable</h1>
                <p className="text-muted-foreground mb-4">
                    {analyticsError.message || "Could not load analytics data at this time."}
                </p>
                <Button onClick={() => refetchAnalytics()} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    // --- No Data State ---
    if (!isAnalyticsLoading && !analyticsData) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-2">No Analytics Data</h1>
                <p className="text-muted-foreground mb-4">No data available for the selected criteria.</p>
            </div>
        );
    }

    // --- Data Processing ---
    const { dailyData = [], avgEngagementRate = "0", campaigns = [], videoMetrics = [], totals = { views: 0, likes: 0, comments: 0, shares: 0, totalVideos: 0 } } = analyticsData ?? {};

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
                    videoMetrics={videoMetrics}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </motion.div>

            <motion.div variants={fadeInUp}>
                <CommentsSection 
                    campaignIds={selectedCampaigns.length > 0 ? selectedCampaigns : campaigns.map(c => c.id)}
                />
            </motion.div>
        </motion.div>
    );
};

export default function AnalyticsClient() {
    const { toast } = useToast()
    const [dateRange, setDateRange] = useState("30")
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [activeMetric, setActiveMetric] = useState<MetricKey>('views')
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])

    const { data: allCampaigns, isLoading: isCampaignsLoading } = api.campaign.getAll.useQuery()
    // Always call this hook unconditionally to maintain hook order
    const { data: analyticsData, refetch: refetchAnalytics } = api.campaign.getCombinedAnalytics.useQuery(
        {
            campaignIds: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
            days: parseInt(dateRange)
        }, {
        refetchOnWindowFocus: false,

    }
    )

    // Memoize content to prevent unnecessary re-renders
    const memoizedContent = useMemo(() => (
        <AnalyticsContent
            selectedCampaigns={selectedCampaigns}
            dateRange={dateRange}
            setCurrentPage={setCurrentPage}
            activeMetric={activeMetric}
            setActiveMetric={setActiveMetric}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            refetchAnalytics={refetchAnalytics}
        />
    ), [selectedCampaigns, dateRange, currentPage, activeMetric, itemsPerPage, refetchAnalytics]);

    const handleDateRangeChange = (value: string) => {
        setDateRange(value);
        setCurrentPage(0);
    };

    const refreshAnalytics = async () => {
        setIsRefreshing(true);
        try {
            await refetchAnalytics();
            toast({
                title: "Analytics refreshed",
                description: "Latest data has been loaded",
            });
        } catch (error) {
            console.error("Error refreshing analytics:", error);
            toast({
                title: "Error refreshing analytics",
                description: "Could not load latest data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
        setSelectedCampaigns(prev => {
            const newSelection = isChecked
                ? [...prev, campaignId]
                : prev.filter(id => id !== campaignId);
            setCurrentPage(0);
            return newSelection;
        });
    };

    const handleResetCampaigns = () => {
        setSelectedCampaigns([]);
        setCurrentPage(0);
    }

    // --- Loading State for campaigns data ---
    if (isCampaignsLoading) {
        return (
            <div className="container max-w-7xl mx-auto py-12 px-4">
                <div className="space-y-8 animate-pulse">
                    <div className="h-10 w-64 bg-muted rounded" />
                    <div className="flex justify-between gap-4">
                        <div className="h-10 w-[300px] bg-muted rounded" />
                        <div className="flex gap-4">
                            <div className="h-10 w-[180px] bg-muted rounded" />
                            <div className="h-10 w-36 bg-muted rounded" />
                        </div>
                    </div>
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
            </div>
        )
    }

    // --- Render UI ---
    return (
        <div className="container max-w-7xl mx-auto py-12 px-4">
            <div className="space-y-8">
                {/* Header doesn't re-render when campaign selection changes */}
                <AnalyticsHeader
                    selectedCampaigns={selectedCampaigns}
                    onCampaignChange={handleCampaignChange}
                    onResetCampaigns={handleResetCampaigns}
                    allCampaigns={allCampaigns}
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    onRefresh={refreshAnalytics}
                    isRefreshing={isRefreshing}
                    campaignCount={allCampaigns?.length || 0}
                    lastUpdatedAt={analyticsData?.lastUpdatedAt}
                />

                {/* Only this part re-renders when campaign selection changes */}
                {memoizedContent}
            </div>
        </div>
    );
} 