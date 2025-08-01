"use client";

import { useState, useMemo } from "react";

interface UseCampaignSelectionProps {
  allCampaigns?: any[];
  folderCampaigns?: any;
  selectedFolderId: string | null;
}

interface UseCampaignSelectionReturn {
  // Search state
  campaignSearchQuery: string;
  setCampaignSearchQuery: (query: string) => void;
  
  // Selection state
  selectedCampaignIds: Set<string>;
  setSelectedCampaignIds: (ids: Set<string>) => void;
  
  // Filtered campaigns
  filteredAvailableCampaigns: any[];
  
  // Selection handlers
  handleCampaignSelect: (campaignId: string, checked: boolean) => void;
  handleSelectAllCampaigns: (checked: boolean) => void;
}

export function useCampaignSelection({ 
  allCampaigns,
  folderCampaigns,
  selectedFolderId
}: UseCampaignSelectionProps): UseCampaignSelectionReturn {
  // Campaign search and management state
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());

  // Filter campaigns based on search query and exclude those already in the selected folder
  const filteredAvailableCampaigns = useMemo(() => {
    if (!allCampaigns) return [];
    
    let filtered = allCampaigns;
    
    // Filter by search query
    if (campaignSearchQuery.trim()) {
      const query = campaignSearchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.campaignName.toLowerCase().includes(query) ||
        campaign.songName.toLowerCase().includes(query) ||
        campaign.artistName.toLowerCase().includes(query) ||
        campaign.genre.toLowerCase().includes(query)
      );
    }
    
    // Exclude campaigns already in the selected folder
    if (selectedFolderId && folderCampaigns?.campaigns) {
      const folderCampaignIds = new Set(folderCampaigns.campaigns.map((c: any) => c._id));
      filtered = filtered.filter(campaign => !folderCampaignIds.has(campaign._id));
    }
    
    return filtered;
  }, [allCampaigns, campaignSearchQuery, selectedFolderId, folderCampaigns]);

  // Handle bulk campaign selection
  const handleCampaignSelect = (campaignId: string, checked: boolean) => {
    const newSelected = new Set(selectedCampaignIds);
    if (checked) {
      newSelected.add(campaignId);
    } else {
      newSelected.delete(campaignId);
    }
    setSelectedCampaignIds(newSelected);
  };

  // Handle select all campaigns
  const handleSelectAllCampaigns = (checked: boolean) => {
    if (checked) {
      setSelectedCampaignIds(new Set(filteredAvailableCampaigns.map(c => c._id)));
    } else {
      setSelectedCampaignIds(new Set());
    }
  };

  return {
    // Search state
    campaignSearchQuery,
    setCampaignSearchQuery,
    
    // Selection state
    selectedCampaignIds,
    setSelectedCampaignIds,
    
    // Filtered campaigns
    filteredAvailableCampaigns,
    
    // Selection handlers
    handleCampaignSelect,
    handleSelectAllCampaigns,
  };
}