"use client"

import { useMemo } from "react";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

// Type definitions for the API response
export interface FolderData {
  folders: {
    id: Id<"folders">;
    name: string;
    createdAt: number;
    updatedAt: number;
    campaigns: Doc<"campaigns">[];
    campaignCount: number;
  }[];
  unorganizedCampaigns: (Doc<"campaigns"> & {
    id: Id<"campaigns">;
    createdAt: number;
    updatedAt: number;
  })[];
}

export interface ProcessedCampaign extends Doc<"campaigns"> {
  isCompleted: boolean;
  id?: Id<"campaigns">;
  createdAt?: number;
  updatedAt?: number;
}

export interface DataSummary {
  totalFolders: number;
  totalCampaigns: number;
  unorganizedCampaigns: number;
  organizedCampaigns: number;
  completedCampaigns: number;
  inProgressCampaigns: number;
  organizationRate: number;
}

interface UseCampaignDataProps {
  folderData: FolderData | undefined;
  selectedView: 'all' | string;
  searchQuery: string;
}

export function useCampaignListData({ folderData, selectedView, searchQuery }: UseCampaignDataProps) {
  return useMemo<{
    processedData: {
      folders: FolderData["folders"];
      allCampaigns: ProcessedCampaign[];
      filteredCampaigns: ProcessedCampaign[];
      unorganizedCampaigns: FolderData["unorganizedCampaigns"];
    };
    dataSummary: DataSummary | null;
  }>(() => {
    if (!folderData) return {
      processedData: { folders: [], allCampaigns: [], filteredCampaigns: [], unorganizedCampaigns: [] },
      dataSummary: null
    };

    // Combine all campaigns from folders and unorganized campaigns
    // Use a Map to ensure uniqueness by campaign ID
    const campaignMap = new Map<Id<"campaigns">, ProcessedCampaign>();
    let duplicateCount = 0;
    
    // Add campaigns from folders
    folderData.folders.forEach(folder => {
      folder.campaigns.forEach(campaign => {
        if (campaignMap.has(campaign._id)) {
          duplicateCount++;
        }
        campaignMap.set(campaign._id, { ...campaign, isCompleted: campaign.status === 'completed' });
      });
    });
    
    // Add unorganized campaigns (won't overwrite if already exists)
    folderData.unorganizedCampaigns.forEach(campaign => {
      if (!campaignMap.has(campaign._id)) {
        campaignMap.set(campaign._id, { ...campaign, isCompleted: campaign.status === 'completed' });
      } else {
        duplicateCount++;
      }
    });
    
    // Log warning if duplicates were found
    if (duplicateCount > 0) {
      console.warn(`Found ${duplicateCount} duplicate campaign(s) in data. This may indicate a data consistency issue.`);
    }
    
    // Sort all campaigns chronologically (newest first)
    const allCampaigns = Array.from(campaignMap.values()).sort((a, b) => 
      new Date(b.createdAt || b._creationTime).getTime() - new Date(a.createdAt || a._creationTime).getTime()
    );

    // Create data summary directly from raw data
    const completedCampaigns = allCampaigns.filter(campaign => campaign.isCompleted).length;
    const summary = {
      totalFolders: folderData.folders.length,
      totalCampaigns: allCampaigns.length,
      unorganizedCampaigns: folderData.unorganizedCampaigns.length,
      organizedCampaigns: allCampaigns.length - folderData.unorganizedCampaigns.length,
      completedCampaigns,
      inProgressCampaigns: allCampaigns.length - completedCampaigns,
      organizationRate: allCampaigns.length > 0
        ? Math.round(((allCampaigns.length - folderData.unorganizedCampaigns.length) / allCampaigns.length) * 100)
        : 0,
    };

    // Filter campaigns based on selected view and search query
    let filteredCampaigns: ProcessedCampaign[] = allCampaigns;

    if (selectedView !== 'all') {
      const selectedFolder = folderData.folders.find(folder => folder.id === selectedView);
      filteredCampaigns = selectedFolder ? selectedFolder.campaigns.map(c => ({ ...c, isCompleted: c.status === 'completed' })) : [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(campaign =>
        campaign.campaignName.toLowerCase().includes(query) ||
        campaign.songName.toLowerCase().includes(query) ||
        campaign.artistName.toLowerCase().includes(query) ||
        campaign.genre.toLowerCase().includes(query)
      );
    }

    // Ensure filtered campaigns are also sorted chronologically (newest first)
    filteredCampaigns = filteredCampaigns.sort((a, b) => 
      new Date(b.createdAt || b._creationTime).getTime() - new Date(a.createdAt || a._creationTime).getTime()
    );

    return {
      processedData: {
        folders: folderData.folders,
        allCampaigns,
        filteredCampaigns,
        unorganizedCampaigns: folderData.unorganizedCampaigns
      },
      dataSummary: summary
    };
  }, [folderData, selectedView, searchQuery]);
}