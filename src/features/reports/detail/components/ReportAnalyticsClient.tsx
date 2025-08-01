"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Eye,
    Heart,
    MessageSquare,
    Share2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { EditVisibleVideosModal } from "@/components/analytics/EditVisibleVideosModal";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import type { MetricKey, MetricInfo, VideoMetric, ReportCampaign } from "../../shared/types/report.types";
import { calculateGrowth } from "../../shared/utils/report.utils";
import { CommentsSection } from "@/components/analytics/CommentsSection";

// Import new components and hooks
import { useReportAnalyticsData } from "../hooks/useReportAnalyticsData";
import { useReportActions } from "../hooks/useReportActions";
import { ReportHeader } from "./ReportHeader";
import { DeleteReportDialog } from "./DeleteReportDialog";
import { ShareReportDialog } from "./ShareReportDialog";
import { 
    LoadingSkeleton, 
    ErrorState, 
    ReportNotFound, 
    NoCampaignsState 
} from "./ReportLoadingStates";

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Metric info for consistent styling and icons
const metricInfo: Record<MetricKey, MetricInfo> = {
    views: {
        label: "Views",
        icon: <Eye className="h-4 w-4" />,
        color: "text-blue-500",
        description: "Total video views"
    },
    likes: {
        label: "Likes",
        icon: <Heart className="h-4 w-4" />,
        color: "text-red-500",
        description: "Total likes received"
    },
    comments: {
        label: "Comments",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "text-green-500",
        description: "Total comments received"
    },
    shares: {
        label: "Shares",
        icon: <Share2 className="h-4 w-4" />,
        color: "text-purple-500",
        description: "Total shares received"
    }
};



export function ReportAnalyticsClient() {
    const params = useParams();
    const reportId = params.id as string;
    const [dateRange, setDateRange] = useState<string>("30");
    const [activeMetric, setActiveMetric] = useState<MetricKey>("views");
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5; // Number of items to show per page
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

    // Fetch report details
    const report = useQuery(api.reports.get, reportId ? { id: reportId as Id<"reports"> } : "skip");
    const isLoadingReport = report === undefined;

    // Use custom hooks for analytics data and actions
    const { analyticsData, isLoadingAnalytics, isRefreshing, refetchAnalytics, refreshAnalytics } = useReportAnalyticsData({
        reportId,
        dateRange,
    });

    const {
        // Delete
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        handleDeleteReport,
        // Share
        isShareDialogOpen,
        setIsShareDialogOpen,
        shareUrl,
        isSharing,
        isCopied,
        handleShareReport,
        copyToClipboard,
        // Edit videos
        isEditVideosModalOpen,
        setIsEditVideosModalOpen,
        handleSaveHiddenVideos,
    } = useReportActions({ 
        reportId, 
        reportName: report?.name 
    });

    const handleDateRangeChange = (value: string) => {
        setDateRange(value);
    };

    const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
        // This function is just a placeholder since we're not implementing campaign filtering
        // in this report view. The component requires it, but it won't actually filter
        console.log("Campaign change:", campaignId, isChecked);
    };

    const handleResetCampaigns = () => {
        // This function is just a placeholder since we're not implementing campaign filtering
        // in this report view. The component requires it, but it won't actually reset
        console.log("Reset campaigns");
    };

    // Loading state
    if (isLoadingReport || isLoadingAnalytics) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (!report || !analyticsData) {
        return <ReportNotFound />;
    }

    // Process data
    const { dailyData = [], avgEngagementRate = "0", videoMetrics = [], hiddenVideoIds = [], lastUpdatedAt, totals = { views: 0, likes: 0, comments: 0, shares: 0 } } = analyticsData ?? {};

    // Store all videos (including hidden ones) for the modal
    const allVideoMetrics = [...videoMetrics];

    console.log("analyticsData", analyticsData);

    // Filter out hidden videos from videoMetrics for display
    const visibleVideoMetrics = videoMetrics.filter(
        (vm: VideoMetric) => !hiddenVideoIds.includes(vm.videoInfo.id)
    );

    const viewsGrowth = calculateGrowth(dailyData, 'views');
    const likesGrowth = calculateGrowth(dailyData, 'likes');
    const commentsGrowth = calculateGrowth(dailyData, 'comments');
    const sharesGrowth = calculateGrowth(dailyData, 'shares');
    const engagementGrowth = calculateGrowth(dailyData, 'engagement');

    const totalVideos = visibleVideoMetrics.length;
    const campaignCount = report?.campaigns.length || 0;

    // Handle the case where the report has no campaigns
    if (campaignCount === 0) {
        return (
            <NoCampaignsState 
                reportId={reportId} 
                reportName={report.name} 
            />
        );
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="container max-w-7xl mx-auto py-12 px-4 space-y-8"
        >
            <motion.div variants={fadeInUp}>
                <ReportHeader
                    reportId={reportId}
                    reportName={report.name}
                    onManageVideos={() => setIsEditVideosModalOpen(true)}
                    onShare={handleShareReport}
                    onDelete={() => setIsDeleteDialogOpen(true)}
                    isSharing={isSharing}
                />
            </motion.div>

            <AnalyticsHeader
                selectedCampaigns={selectedCampaigns}
                onCampaignChange={handleCampaignChange}
                onResetCampaigns={handleResetCampaigns}
                allCampaigns={report.campaigns.map((c: ReportCampaign) => ({
                    id: c.id,
                    campaignName: c.campaignName
                }))}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onRefresh={refreshAnalytics}
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
                viewsGrowth={viewsGrowth}
                likesGrowth={likesGrowth}
                commentsGrowth={commentsGrowth}
                sharesGrowth={sharesGrowth}
                engagementGrowth={engagementGrowth}
            />

            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    videoMetrics={visibleVideoMetrics}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </motion.div>

            {/* Comments Section */}
            <motion.div variants={fadeInUp}>
                <CommentsSection 
                    campaignIds={report.campaigns.map((c: ReportCampaign) => c.id)}
                />
            </motion.div>

            {/* Dialogs */}
            <DeleteReportDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                reportName={report.name}
                onConfirm={handleDeleteReport}
            />

            <ShareReportDialog
                open={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
                shareUrl={shareUrl}
                isCopied={isCopied}
                onCopyToClipboard={copyToClipboard}
            />

            <EditVisibleVideosModal
                allVideoMetrics={allVideoMetrics}
                initialHiddenVideoIds={hiddenVideoIds}
                onSave={(newHiddenVideoIds) => handleSaveHiddenVideos(newHiddenVideoIds, refetchAnalytics)}
                onCancel={() => setIsEditVideosModalOpen(false)}
                open={isEditVideosModalOpen}
                isSaving={false}
            />
        </motion.div>
    );
}