"use client";

import { Form } from "@/components/ui/form";
import { useCampaignSelection } from "../hooks/useCampaignSelection";
import { useReportForm } from "../hooks/useReportForm";
import { CampaignSelectionCard } from "./CampaignSelectionCard";
import { ReportNameField } from "./ReportNameField";
import { ReportFormActions } from "./ReportFormActions";
import type { ReportFormValues } from '../types/report.types';

interface ReportFormProps {
    onSubmit: (values: ReportFormValues) => Promise<void>;
    initialData?: Partial<ReportFormValues & { campaignIds: string[] }>;
    isLoading?: boolean;
    submitButtonText?: string;
}

export function ReportForm({ 
    onSubmit,
    initialData = {},
    isLoading = false,
    submitButtonText = "Save Report"
}: ReportFormProps) {
    
    // Use custom hooks for form and campaign selection
    const { form, selectedCampaignIds, handleFormSubmit } = useReportForm({
        initialData,
        onSubmit,
        isLoading,
    });

    const {
        campaigns,
        isLoadingCampaigns,
        campaignsError,
        allCampaignIds,
        selectAll,
        clearAll,
    } = useCampaignSelection();

    const handleSelectAll = () => {
        selectAll(form.setValue);
    };

    const handleClearAll = () => {
        clearAll(form.setValue);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                <ReportNameField
                    control={form.control}
                    name="name"
                />

                <CampaignSelectionCard
                    control={form.control}
                    campaigns={campaigns}
                    isLoadingCampaigns={isLoadingCampaigns}
                    campaignsError={campaignsError}
                    selectedCampaignIds={selectedCampaignIds}
                    allCampaignIds={allCampaignIds}
                    onSelectAll={handleSelectAll}
                    onClearAll={handleClearAll}
                />

                <ReportFormActions
                    isLoading={isLoading}
                    isLoadingCampaigns={isLoadingCampaigns}
                    hasCampaigns={campaigns && campaigns.length > 0}
                    submitButtonText={submitButtonText}
                />
            </form>
        </Form>
    );
}