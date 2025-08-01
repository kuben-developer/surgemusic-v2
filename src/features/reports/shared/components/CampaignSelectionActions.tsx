"use client";

import { Button } from "@/components/ui/button";

interface CampaignSelectionActionsProps {
    onSelectAll: () => void;
    onClearAll: () => void;
    isLoadingCampaigns: boolean;
    selectedCount: number;
    totalCount: number;
}

export function CampaignSelectionActions({
    onSelectAll,
    onClearAll,
    isLoadingCampaigns,
    selectedCount,
    totalCount,
}: CampaignSelectionActionsProps) {
    const isAllSelected = selectedCount === totalCount;
    const hasSelection = selectedCount > 0;

    return (
        <div className="mb-4 flex justify-between items-center">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                disabled={isLoadingCampaigns || isAllSelected}
                className="text-xs"
            >
                Select All
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearAll}
                disabled={isLoadingCampaigns || !hasSelection}
                className="text-xs"
            >
                Clear Selection
            </Button>
        </div>
    );
}