"use client";

import React from 'react';
import { toast } from "sonner";
import type { ReportFormValues } from '../types/report.types';

interface UseReportFormProps {
    initialData?: Partial<ReportFormValues & { campaignIds: string[] }>;
    onSubmit: (values: ReportFormValues) => Promise<void>;
    isLoading?: boolean;
}

interface FormErrors {
    name?: string;
    campaignIds?: string;
}

export function useReportForm({ 
    initialData = {}, 
    onSubmit,
    isLoading = false 
}: UseReportFormProps) {
    const [name, setName] = React.useState(initialData.name ?? "");
    const [campaignIds, setCampaignIds] = React.useState<string[]>(initialData.campaignIds ?? []);
    const [errors, setErrors] = React.useState<FormErrors>({});

    // Reset form if initialData changes (e.g., on edit page load)
    React.useEffect(() => {
        if (!isLoading && initialData.name !== undefined) {
            setName(initialData.name);
            setCampaignIds(initialData.campaignIds ?? []);
            setErrors({});
        }
    }, [initialData, isLoading]);

    // Validation function
    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        
        if (!name.trim()) {
            newErrors.name = "Report name cannot be empty.";
        }
        
        if (campaignIds.length === 0) {
            newErrors.campaignIds = "You have to select at least one campaign.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        try {
            await onSubmit({ name, campaignIds });
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error("An unexpected error occurred."); 
        }
    };

    // Clear specific error when field is updated
    const handleNameChange = (value: string) => {
        setName(value);
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: undefined }));
        }
    };

    const handleCampaignIdsChange = (ids: string[]) => {
        setCampaignIds(ids);
        if (errors.campaignIds) {
            setErrors(prev => ({ ...prev, campaignIds: undefined }));
        }
    };

    return {
        name,
        campaignIds,
        errors,
        setName: handleNameChange,
        setCampaignIds: handleCampaignIdsChange,
        handleSubmit,
    };
}