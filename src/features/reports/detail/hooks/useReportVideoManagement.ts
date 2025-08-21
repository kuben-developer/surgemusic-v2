"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface UseReportVideoManagementProps {
    reportId: string | null;
}

export function useReportVideoManagement({ reportId }: UseReportVideoManagementProps) {
    const [isEditVideosModalOpen, setIsEditVideosModalOpen] = useState(false);
    const updateHiddenVideosMutation = useMutation(api.app.reports.updateHiddenVideos);

    const handleSaveHiddenVideos = async (
        newHiddenVideoIds: string[], 
        refetchAnalytics: () => Promise<void>
    ) => {
        if (!reportId) {
            toast.error("Invalid report ID");
            return;
        }
        
        try {
            await updateHiddenVideosMutation({
                reportId: reportId as Id<"reports">,
                hiddenVideoIds: newHiddenVideoIds as (Id<"generatedVideos"> | Id<"manuallyPostedVideos">)[],
            });
            
            toast.success("Video visibility updated successfully!");
            setIsEditVideosModalOpen(false);
            
            // Refetch analytics data to reflect changes
            await refetchAnalytics();
        } catch (error) {
            toast.error(`Failed to update video visibility: ${(error as Error).message}`);
        }
    };

    return {
        isEditVideosModalOpen,
        setIsEditVideosModalOpen,
        handleSaveHiddenVideos,
    };
}