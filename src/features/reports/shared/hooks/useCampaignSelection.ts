"use client";

import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type SetValueFunction = (name: "campaignIds", value: string[], options?: { shouldValidate?: boolean }) => void;

interface UseCampaignSelectionReturn {
  campaigns: Doc<"campaigns">[];
  isLoadingCampaigns: boolean;
  campaignsError: null;
  allCampaignIds: string[];
  selectAll: (setValue: SetValueFunction) => void;
  clearAll: (setValue: SetValueFunction) => void;
}

export function useCampaignSelection(): UseCampaignSelectionReturn {
  // Fetch campaigns for selection
  const campaignsResult = useQuery(api.app.campaigns.getAll);
  const isLoadingCampaigns = campaignsResult === undefined;
  const campaigns = campaignsResult ?? [];
  const campaignsError = null; // Convex doesn't expose errors the same way

  const allCampaignIds = React.useMemo(() => campaigns.map((c) => c._id), [campaigns]);

  const selectAll = (setValue: SetValueFunction) => {
    setValue("campaignIds", allCampaignIds, { shouldValidate: true });
  };

  const clearAll = (setValue: SetValueFunction) => {
    setValue("campaignIds", [], { shouldValidate: true });
  };

  return {
    campaigns,
    isLoadingCampaigns,
    campaignsError,
    allCampaignIds,
    selectAll,
    clearAll,
  };
}