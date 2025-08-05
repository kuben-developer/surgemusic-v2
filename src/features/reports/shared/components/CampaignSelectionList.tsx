"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface CampaignSelectionListProps {
    campaigns: Doc<"campaigns">[];
    selectedCampaignIds: string[];
    onToggleCampaign: (campaignId: string, checked: boolean) => void;
}

export function CampaignSelectionList({
    campaigns,
    selectedCampaignIds,
    onToggleCampaign,
}: CampaignSelectionListProps) {
    return (
        <ScrollArea className="h-60 w-full rounded-md border">
            <div className="p-4">
                {campaigns.map((campaign) => (
                    <div
                        key={campaign._id}
                        className="flex flex-row items-center space-x-3 space-y-0 py-2 border-b last:border-b-0"
                    >
                        <Checkbox
                            id={`campaign-${campaign._id}`}
                            checked={selectedCampaignIds.includes(campaign._id)}
                            onCheckedChange={(checked) => {
                                onToggleCampaign(campaign._id, checked as boolean);
                            }}
                        />
                        <Label 
                            htmlFor={`campaign-${campaign._id}`}
                            className="font-normal flex-1 cursor-pointer"
                        >
                            {campaign.campaignName}
                        </Label>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}