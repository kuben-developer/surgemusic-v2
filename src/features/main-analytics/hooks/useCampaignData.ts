"use client"

import { useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface CampaignDataItem {
  id: string;
  campaignName: string;
}

interface UseCampaignDataReturn {
  allCampaigns: CampaignDataItem[];
  isCampaignsLoading: boolean;
  campaignCount: number;
}

/**
 * Custom hook for fetching and transforming campaign data
 * Separates campaign data concerns from the main analytics page
 */
export function useCampaignData(): UseCampaignDataReturn {
  // Fetch campaigns data from Convex
  const rawCampaigns = useQuery(api.campaigns.getAll);
  const isCampaignsLoading = rawCampaigns === undefined;

  // Transform campaigns data to the expected format
  const allCampaigns = useMemo(() => {
    if (!rawCampaigns) return [];
    
    return rawCampaigns.map(campaign => ({
      id: campaign._id,
      campaignName: campaign.campaignName
    }));
  }, [rawCampaigns]);

  const campaignCount = allCampaigns.length;

  return {
    allCampaigns,
    isCampaignsLoading,
    campaignCount
  };
}