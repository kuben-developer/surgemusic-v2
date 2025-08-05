"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { CampaignSelectionHeader } from "./CampaignSelectionHeader";
import { CampaignSelectionStates } from "./CampaignSelectionStates";
import { CampaignSelectionActions } from "./CampaignSelectionActions";
import { CampaignSelectionList } from "./CampaignSelectionList";

interface CampaignSelectionCardProps {
    campaigns: Doc<"campaigns">[];
    isLoadingCampaigns: boolean;
    campaignsError: null;
    selectedCampaignIds: string[];
    allCampaignIds: string[];
    onSelectAll: () => void;
    onClearAll: () => void;
    onToggleCampaign: (campaignId: string, checked: boolean) => void;
    error?: string;
}

export function CampaignSelectionCard({
    campaigns,
    isLoadingCampaigns,
    campaignsError,
    selectedCampaignIds,
    allCampaignIds,
    onSelectAll,
    onClearAll,
    onToggleCampaign,
    error,
}: CampaignSelectionCardProps) {
    const hasCampaigns = campaigns && campaigns.length > 0;
    const shouldShowContent = !isLoadingCampaigns && !campaignsError && hasCampaigns;

    return (
        <div className="space-y-2">
            <Card>
                <CampaignSelectionHeader />
                <CardContent>
                    <CampaignSelectionStates
                        isLoadingCampaigns={isLoadingCampaigns}
                        campaignsError={campaignsError}
                        hasCampaigns={hasCampaigns}
                    />
                    
                    {shouldShowContent && (
                        <>
                            <CampaignSelectionActions
                                onSelectAll={onSelectAll}
                                onClearAll={onClearAll}
                                isLoadingCampaigns={isLoadingCampaigns}
                                selectedCount={selectedCampaignIds.length}
                                totalCount={allCampaignIds.length}
                            />
                            <CampaignSelectionList
                                campaigns={campaigns}
                                selectedCampaignIds={selectedCampaignIds}
                                onToggleCampaign={onToggleCampaign}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
            {error && (
                <p className="text-sm text-destructive pt-2">{error}</p>
            )}
        </div>
    );
}