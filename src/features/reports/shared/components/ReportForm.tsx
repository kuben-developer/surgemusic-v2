"use client";

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
    const { 
        name, 
        campaignIds, 
        errors, 
        setName, 
        setCampaignIds, 
        handleSubmit 
    } = useReportForm({
        initialData,
        onSubmit,
        isLoading,
    });

    const {
        campaigns,
        isLoadingCampaigns,
        campaignsError,
        allCampaignIds,
    } = useCampaignSelection();

    const handleSelectAll = () => {
        setCampaignIds(allCampaignIds);
    };

    const handleClearAll = () => {
        setCampaignIds([]);
    };

    const handleToggleCampaign = (campaignId: string, checked: boolean) => {
        if (checked) {
            // Only add if not already selected to prevent duplicates
            if (!campaignIds.includes(campaignId)) {
                setCampaignIds([...campaignIds, campaignId]);
            }
        } else {
            setCampaignIds(campaignIds.filter(id => id !== campaignId));
        }
    };

    return (
        <div className="space-y-8">
            <ReportNameField
                value={name}
                onChange={setName}
                error={errors.name}
                disabled={isLoading}
            />

            <CampaignSelectionCard
                campaigns={campaigns}
                isLoadingCampaigns={isLoadingCampaigns}
                campaignsError={campaignsError}
                selectedCampaignIds={campaignIds}
                allCampaignIds={allCampaignIds}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                onToggleCampaign={handleToggleCampaign}
                error={errors.campaignIds}
            />

            <ReportFormActions
                isLoading={isLoading}
                isLoadingCampaigns={isLoadingCampaigns}
                hasCampaigns={campaigns && campaigns.length > 0}
                submitButtonText={submitButtonText}
                onSubmit={handleSubmit}
            />
        </div>
    );
}