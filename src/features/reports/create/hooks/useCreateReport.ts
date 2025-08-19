"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import type { ReportFormValues } from '../../shared/types/report.types';

export function useCreateReport() {
    const router = useRouter();
    const createMutation = useMutation(api.app.reports.create);
    const [isCreating, setIsCreating] = useState(false);

    const createReport = async (values: ReportFormValues) => {
        // Ensure campaignIds is defined and not empty for the create API call
        if (!values.campaignIds || values.campaignIds.length === 0) {
            toast.error("Please select at least one campaign.");
            return;
        }
        
        setIsCreating(true);
        try {
            const data = await createMutation({
                name: values.name,
                campaignIds: values.campaignIds.map(id => id as Id<"campaigns">),
            });
            toast.success(`Report "${data.name}" created successfully.`);
            // Redirect to the report analytics page
            router.push(`/reports/${data._id}`);
        } catch (error) {
            toast.error(`Failed to create report: ${(error as Error).message}`);
        } finally {
            setIsCreating(false);
        }
    };

    return {
        createReport,
        isCreating
    };
}