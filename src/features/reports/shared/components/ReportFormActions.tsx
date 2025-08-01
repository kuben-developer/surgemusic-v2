"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportFormActionsProps {
    isLoading?: boolean;
    isLoadingCampaigns?: boolean;
    hasCampaigns?: boolean;
    submitButtonText?: string;
}

export function ReportFormActions({
    isLoading = false,
    isLoadingCampaigns = false,
    hasCampaigns = true,
    submitButtonText = "Save Report",
}: ReportFormActionsProps) {
    const isDisabled = isLoading || isLoadingCampaigns || !hasCampaigns;

    return (
        <Button 
            type="submit" 
            disabled={isDisabled} 
            className="flex items-center gap-2"
        >
            {isLoading ? (
                <>
                    <span className="animate-spin h-4 w-4 border-b-2 border-current rounded-full inline-block"></span>
                    Saving...
                </>
            ) : (
                <>
                   <Save className="h-4 w-4" />
                   {submitButtonText}
                </>
            )}
        </Button>
    );
}