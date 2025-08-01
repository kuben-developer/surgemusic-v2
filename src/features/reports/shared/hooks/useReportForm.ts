"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { ReportFormValues } from '../types/report.types';

// Define the Zod schema for the form
const reportFormSchema = z.object({
    name: z.string().min(1, { message: "Report name cannot be empty." }),
    campaignIds: z.array(z.string()).min(1, { message: "You have to select at least one campaign." }),
}) satisfies z.ZodType<ReportFormValues>;

interface UseReportFormProps {
    initialData?: Partial<ReportFormValues & { campaignIds: string[] }>;
    onSubmit: (values: ReportFormValues) => Promise<void>;
    isLoading?: boolean;
}

export function useReportForm({ 
    initialData = {}, 
    onSubmit,
    isLoading = false 
}: UseReportFormProps) {
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: { 
            name: initialData.name ?? "", 
            campaignIds: initialData.campaignIds ?? [] 
        },
    });

    // Watch campaignIds for checkbox updates
    const selectedCampaignIds = form.watch("campaignIds", initialData.campaignIds ?? []);

    // Reset form if initialData changes (e.g., on edit page load)
    React.useEffect(() => {
        if (!isLoading && initialData.name !== undefined) {
            form.reset({
                name: initialData.name,
                campaignIds: initialData.campaignIds ?? []
            });
        }
    }, [initialData, form, isLoading]);

    // Wrapper for the onSubmit prop to handle form state and potential errors
    const handleFormSubmit = async (values: ReportFormValues) => {
        try {
            await onSubmit(values);
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error("An unexpected error occurred."); 
        }
    };

    return {
        form,
        selectedCampaignIds,
        handleFormSubmit,
    };
}