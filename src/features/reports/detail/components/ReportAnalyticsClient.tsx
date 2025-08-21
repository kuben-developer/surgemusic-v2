"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

// Import components and hooks
import { useReportAnalytics } from "../hooks/useReportAnalytics";
import { useReportActions } from "../hooks/useReportActions";
import { ReportHeader } from "./ReportHeader";
import { AnalyticsContent } from "./AnalyticsContent";
import { AnalyticsDialogs } from "./AnalyticsDialogs";
import { 
    LoadingSkeleton, 
    ReportNotFound, 
    NoCampaignsState 
} from "./ReportLoadingStates";

// Import constants
import { fadeInUp, staggerContainer } from "../constants/analytics.constants";

export function ReportAnalyticsClient() {
    const params = useParams();
    const reportId = params.id as string;
    
    // Fetch report details
    const report = useQuery(api.app.reports.get, reportId ? { id: reportId as Id<"reports"> } : "skip");
    const isLoadingReport = report === undefined;

    // Transform report data for the hook
    const transformedReport = report ? {
        name: report.name,
        campaigns: report.campaigns.map(c => ({
            id: c._id,
            campaignName: c.campaignName
        }))
    } : null;

    // Use consolidated analytics hook
    const {
        analyticsData,
        growthData,
        processedData,
        state,
        handlers,
        isLoadingAnalytics,
        refreshAnalytics,
    } = useReportAnalytics({
        reportId,
        report: transformedReport!,
    });

    const reportActions = useReportActions({ 
        reportId, 
        reportName: report?.name 
    });

    // Loading state
    if (isLoadingReport || isLoadingAnalytics) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (!report || !analyticsData) {
        return <ReportNotFound />;
    }
    
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
                    onManageVideos={() => reportActions.setIsEditVideosModalOpen(true)}
                    onShare={reportActions.handleShareReport}
                    onDelete={() => reportActions.setIsDeleteDialogOpen(true)}
                    isSharing={reportActions.isSharing}
                />
            </motion.div>

            <AnalyticsContent
                report={transformedReport!}
                analyticsData={analyticsData}
                growthData={growthData!}
                processedData={processedData}
                state={state}
                handlers={handlers}
            />

            <AnalyticsDialogs
                reportName={report.name}
                allVideoMetrics={analyticsData.allVideoMetrics || analyticsData.videoMetrics}
                hiddenVideoIds={analyticsData.hiddenVideoIds || []}
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
                refetchAnalytics={refreshAnalytics}
            />
        </motion.div>
    );
}