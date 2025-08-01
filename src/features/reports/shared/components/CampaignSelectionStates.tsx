"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface CampaignSelectionStatesProps {
    isLoadingCampaigns: boolean;
    campaignsError: null;
    hasCampaigns: boolean;
}

export function CampaignSelectionStates({
    isLoadingCampaigns,
    campaignsError,
    hasCampaigns,
}: CampaignSelectionStatesProps) {
    if (isLoadingCampaigns) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
            </div>
        );
    }

    if (campaignsError) {
        return (
            <p className="text-sm font-medium text-destructive">
                Error loading campaigns
            </p>
        );
    }

    if (!hasCampaigns) {
        return (
            <div className="p-4 border rounded-md bg-muted text-muted-foreground text-center">
                No campaigns found. Please create a campaign first.
            </div>
        );
    }

    return null;
}