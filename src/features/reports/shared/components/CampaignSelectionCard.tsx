"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import type { Campaign } from "../types/report.types";
import { CampaignSelectionHeader } from "./CampaignSelectionHeader";
import { CampaignSelectionStates } from "./CampaignSelectionStates";
import { CampaignSelectionActions } from "./CampaignSelectionActions";
import { CampaignSelectionList } from "./CampaignSelectionList";

interface CampaignSelectionCardProps<T extends FieldValues> {
    control: Control<T>;
    campaigns: Campaign[];
    isLoadingCampaigns: boolean;
    campaignsError: null;
    selectedCampaignIds: string[];
    allCampaignIds: string[];
    onSelectAll: () => void;
    onClearAll: () => void;
}

export function CampaignSelectionCard<T extends FieldValues>({
    control,
    campaigns,
    isLoadingCampaigns,
    campaignsError,
    selectedCampaignIds,
    allCampaignIds,
    onSelectAll,
    onClearAll,
}: CampaignSelectionCardProps<T>) {
    const hasCampaigns = campaigns && campaigns.length > 0;
    const shouldShowContent = !isLoadingCampaigns && !campaignsError && hasCampaigns;

    return (
        <FormField
            control={control}
            name={"campaignIds" as Path<T>}
            render={() => (
                <FormItem>
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
                                        control={control}
                                        campaigns={campaigns}
                                    />
                                </>
                            )}
                            <FormMessage className="pt-2" />
                        </CardContent>
                    </Card>
                </FormItem>
            )}
        />
    );
}