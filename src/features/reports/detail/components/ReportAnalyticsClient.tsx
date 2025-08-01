"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

// Import components and hooks
import { useReportAnalyticsData } from "../hooks/useReportAnalyticsData";
import { useReportActions } from "../hooks/useReportActions";
import { useAnalyticsState } from "../hooks/useAnalyticsState";
import { useReportAnalyticsState } from "../hooks/useReportAnalyticsState";
import { ReportHeader } from "./ReportHeader";
import { AnalyticsContent } from "./AnalyticsContent";
import { AnalyticsDialogs } from "./AnalyticsDialogs";
import { 
    LoadingSkeleton, 
    ReportNotFound, 
    NoCampaignsState 
} from "./ReportLoadingStates";

// Import utilities and constants
import { calculateAllGrowthMetrics, processAnalyticsData } from "../utils/analytics.utils";
import { fadeInUp, staggerContainer } from "../constants/analytics.constants";

export function ReportAnalyticsClient() {
    const params = useParams();
    const reportId = params.id as string;

    // Custom hooks for state management
    const analyticsState = useAnalyticsState();
    
    // Fetch report details
    const report = useQuery(api.reports.get, reportId ? { id: reportId as Id<"reports"> } : "skip");
    const isLoadingReport = report === undefined;

    // Use custom hooks for analytics data and actions
    const { analyticsData, isLoadingAnalytics, isRefreshing, refetchAnalytics, refreshAnalytics } = useReportAnalyticsData({
        reportId,
        dateRange: analyticsState.dateRange,
    });

    const reportActions = useReportActions({ 
        reportId, 
        reportName: report?.name 
    });

    // Prepare state and handlers for AnalyticsContent
    const { state, handlers } = useReportAnalyticsState({
        analyticsState,
        refreshAnalytics,
        isRefreshing,
    });

    // Loading state
    if (isLoadingReport || isLoadingAnalytics) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (!report || !analyticsData) {
        return <ReportNotFound />;
    }

    // Process analytics data
    const processedData = processAnalyticsData(analyticsData);
    const growthData = calculateAllGrowthMetrics(processedData.dailyData);
    
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

    // Transform report data
    const transformedReport = {
        name: report.name,
        campaigns: report.campaigns.map(c => ({
            id: c._id,
            campaignName: c.campaignName
        }))
    };

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
                    onManageVideos={() => reportActions.setIsEditVideosModalOpen(true)}
                    onShare={reportActions.handleShareReport}
                    onDelete={() => reportActions.setIsDeleteDialogOpen(true)}
                    isSharing={reportActions.isSharing}
                />
            </motion.div>

            <AnalyticsContent
                report={transformedReport}
                analyticsData={processedData}
                growthData={growthData}
                state={state}
                handlers={handlers}
            />

            <AnalyticsDialogs
                reportName={report.name}
                allVideoMetrics={processedData.allVideoMetrics}
                hiddenVideoIds={processedData.hiddenVideoIds}
                isDeleteDialogOpen={reportActions.isDeleteDialogOpen}
                onDeleteDialogChange={reportActions.setIsDeleteDialogOpen}
                onDeleteConfirm={reportActions.handleDeleteReport}
                isShareDialogOpen={reportActions.isShareDialogOpen}
                onShareDialogChange={reportActions.setIsShareDialogOpen}
                shareUrl={reportActions.shareUrl}
                isCopied={reportActions.isCopied}
                onCopyToClipboard={reportActions.copyToClipboard}
                isEditVideosModalOpen={reportActions.isEditVideosModalOpen}
                onEditVideosModalChange={reportActions.setIsEditVideosModalOpen}
                onSaveHiddenVideos={reportActions.handleSaveHiddenVideos}
                refetchAnalytics={refetchAnalytics}
            />
        </motion.div>
    );
}