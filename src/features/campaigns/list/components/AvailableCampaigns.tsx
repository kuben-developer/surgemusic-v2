"use client";

import type { Doc } from "../../../../../convex/_generated/dataModel";
import { AvailableCampaignsHeader } from "./AvailableCampaignsHeader";
import { CampaignSearchInput } from "./CampaignSearchInput";
import { CampaignBulkActions } from "./CampaignBulkActions";
import { CampaignGrid } from "./CampaignGrid";
import { useAvailableCampaigns } from "../hooks/useAvailableCampaigns";

interface AvailableCampaignsProps {
  filteredAvailableCampaigns: Doc<"campaigns">[];
  campaignsLoading: boolean;
  campaignSearchQuery: string;
  setCampaignSearchQuery: (query: string) => void;
  selectedCampaignIds: Set<string>;
  onCampaignSelect: (campaignId: string, checked: boolean) => void;
  onSelectAllCampaigns: (checked: boolean) => void;
  onBulkAddCampaigns: () => Promise<void>;
}

export function AvailableCampaigns({
  filteredAvailableCampaigns,
  campaignsLoading,
  campaignSearchQuery,
  setCampaignSearchQuery,
  selectedCampaignIds,
  onCampaignSelect,
  onSelectAllCampaigns,
  onBulkAddCampaigns,
}: AvailableCampaignsProps) {
  const { isAllSelected, selectedCount, totalCampaigns } = useAvailableCampaigns({
    filteredAvailableCampaigns,
    selectedCampaignIds,
  });

  return (
    <div className="flex-1 p-6 border-r">
      <div className="space-y-4">
        <AvailableCampaignsHeader campaignCount={totalCampaigns} />
        
        <div className="space-y-3">
          <CampaignSearchInput
            value={campaignSearchQuery}
            onChange={setCampaignSearchQuery}
          />
          
          <CampaignBulkActions
            totalCampaigns={totalCampaigns}
            selectedCount={selectedCount}
            isAllSelected={isAllSelected}
            onSelectAll={onSelectAllCampaigns}
            onBulkAdd={onBulkAddCampaigns}
          />
        </div>
        
        <CampaignGrid
          campaigns={filteredAvailableCampaigns}
          isLoading={campaignsLoading}
          selectedCampaignIds={selectedCampaignIds}
          searchQuery={campaignSearchQuery}
          onCampaignSelect={onCampaignSelect}
        />
      </div>
    </div>
  );
}