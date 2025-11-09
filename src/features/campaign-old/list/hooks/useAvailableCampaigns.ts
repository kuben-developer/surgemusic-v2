"use client";

import { useMemo } from "react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface UseAvailableCampaignsProps {
  filteredAvailableCampaigns: Doc<"campaigns">[];
  selectedCampaignIds: Set<string>;
}

interface UseAvailableCampaignsReturn {
  isAllSelected: boolean;
  selectedCount: number;
  totalCampaigns: number;
}

export function useAvailableCampaigns({
  filteredAvailableCampaigns,
  selectedCampaignIds,
}: UseAvailableCampaignsProps): UseAvailableCampaignsReturn {
  const selectedCount = selectedCampaignIds.size;
  const totalCampaigns = filteredAvailableCampaigns.length;
  
  const isAllSelected = useMemo(() => {
    return selectedCount === totalCampaigns && totalCampaigns > 0;
  }, [selectedCount, totalCampaigns]);

  return {
    isAllSelected,
    selectedCount,
    totalCampaigns,
  };
}