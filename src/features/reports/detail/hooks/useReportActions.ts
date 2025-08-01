"use client";

import { useReportDelete } from "./useReportDelete";
import { useReportShare } from "./useReportShare";
import { useReportVideoManagement } from "./useReportVideoManagement";

interface UseReportActionsProps {
    reportId: string | null;
    reportName?: string;
}

interface UseReportActionsReturn {
    // Delete state
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    handleDeleteReport: () => Promise<void>;
    
    // Share state
    isShareDialogOpen: boolean;
    setIsShareDialogOpen: (open: boolean) => void;
    shareUrl: string;
    isSharing: boolean;
    isCopied: boolean;
    handleShareReport: () => Promise<void>;
    copyToClipboard: () => Promise<void>;
    
    // Edit videos state
    isEditVideosModalOpen: boolean;
    setIsEditVideosModalOpen: (open: boolean) => void;
    handleSaveHiddenVideos: (newHiddenVideoIds: string[], refetchAnalytics: () => Promise<void>) => Promise<void>;
}

export function useReportActions({ 
    reportId, 
    reportName 
}: UseReportActionsProps): UseReportActionsReturn {
    // Use composed hooks
    const deleteActions = useReportDelete({ reportId, reportName });
    const shareActions = useReportShare({ reportId });
    const videoManagementActions = useReportVideoManagement({ reportId });

    return {
        // Delete actions
        ...deleteActions,
        
        // Share actions  
        ...shareActions,
        
        // Video management actions
        ...videoManagementActions,
    };
}