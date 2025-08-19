"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface UseReportDeleteProps {
    reportId: string | null;
    reportName?: string;
}

export function useReportDelete({ reportId, reportName }: UseReportDeleteProps) {
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const deleteReportMutation = useMutation(api.app.reports.deleteReport);
    
    const handleDeleteReport = async () => {
        if (!reportId) {
            toast.error("Invalid report ID");
            return;
        }
        
        try {
            const data = await deleteReportMutation({ 
                id: reportId as Id<"reports"> 
            });
            toast.success(`Report "${data.name}" deleted successfully.`);
            setIsDeleteDialogOpen(false);
            router.push("/reports");
        } catch (error) {
            toast.error(`Failed to delete report: ${(error as Error).message}`);
        }
    };

    return {
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        handleDeleteReport,
    };
}