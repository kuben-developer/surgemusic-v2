"use client";

import { EditVisibleVideosModal } from "@/components/analytics/EditVisibleVideosModal";
import { DeleteReportDialog } from "./DeleteReportDialog";
import { ShareReportDialog } from "./ShareReportDialog";
import type { VideoMetric } from "../../shared/types/report.types";

interface AnalyticsDialogsProps {
    // Report data
    reportName: string;
    
    // Video data
    allVideoMetrics: VideoMetric[];
    hiddenVideoIds: string[];
    
    // Delete dialog
    isDeleteDialogOpen: boolean;
    onDeleteDialogChange: (open: boolean) => void;
    onDeleteConfirm: () => Promise<void>;
    
    // Share dialog
    isShareDialogOpen: boolean;
    onShareDialogChange: (open: boolean) => void;
    shareUrl: string;
    isCopied: boolean;
    onCopyToClipboard: () => Promise<void>;
    
    // Edit videos modal
    isEditVideosModalOpen: boolean;
    onEditVideosModalChange: (open: boolean) => void;
    onSaveHiddenVideos: (hiddenVideoIds: string[], refetch: () => Promise<void>) => Promise<void>;
    refetchAnalytics: () => Promise<void>;
}

export function AnalyticsDialogs({
    reportName,
    allVideoMetrics,
    hiddenVideoIds,
    isDeleteDialogOpen,
    onDeleteDialogChange,
    onDeleteConfirm,
    isShareDialogOpen,
    onShareDialogChange,
    shareUrl,
    isCopied,
    onCopyToClipboard,
    isEditVideosModalOpen,
    onEditVideosModalChange,
    onSaveHiddenVideos,
    refetchAnalytics,
}: AnalyticsDialogsProps) {
    return (
        <>
            <DeleteReportDialog
                open={isDeleteDialogOpen}
                onOpenChange={onDeleteDialogChange}
                reportName={reportName}
                onConfirm={onDeleteConfirm}
            />

            <ShareReportDialog
                open={isShareDialogOpen}
                onOpenChange={onShareDialogChange}
                shareUrl={shareUrl}
                isCopied={isCopied}
                onCopyToClipboard={onCopyToClipboard}
            />

            <EditVisibleVideosModal
                allVideoMetrics={allVideoMetrics}
                initialHiddenVideoIds={hiddenVideoIds}
                onSave={(newHiddenVideoIds) => onSaveHiddenVideos(newHiddenVideoIds, refetchAnalytics)}
                onCancel={() => onEditVideosModalChange(false)}
                open={isEditVideosModalOpen}
                isSaving={false}
            />
        </>
    );
}