"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import type { ReportFormValues } from '../../shared/types/report.types';

export function useEditReport(reportId: string) {
    const router = useRouter();
    const updateMutation = useMutation(api.reports.update);
    const [isUpdating, setIsUpdating] = useState(false);

    const updateReport = async (values: ReportFormValues) => {
        // Ensure campaignIds is defined if provided (API requires min 1 if updating)
        if (values.campaignIds && values.campaignIds.length === 0) {
            toast.error("Please select at least one campaign if modifying selection.");
            return;
        }

        setIsUpdating(true);
        try {
            const data = await updateMutation({
                id: reportId as Id<"reports">,
                name: values.name,
                // Only include campaignIds if they are part of the values submitted
                ...(values.campaignIds && { campaignIds: values.campaignIds.map(id => id as Id<"campaigns">) }),
            });
            toast.success(`Report "${data.name}" updated successfully.`);
            router.push(`/reports/${reportId}`);
        } catch (error) {
            toast.error(`Failed to update report: ${(error as Error).message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateReport,
        isUpdating
    };
}