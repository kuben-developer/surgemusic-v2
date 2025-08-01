"use client"

import { useMemo } from "react";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

// Type definitions for the API response
export interface FolderData {
  folders: {
    id: Id<"folders">;
    name: string;
    campaigns: Doc<"campaigns">[];
    campaignCount: number;
  }[];
  unorganizedCampaigns: Doc<"campaigns">[];
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
  statusFilter: "all" | "pending" | "completed" | "failed";
  dateFilter: "all" | "today" | "week" | "month" | "year";
}

export function useCampaignListData({ folderData, selectedView, searchQuery, statusFilter, dateFilter }: UseCampaignDataProps) {
  return useMemo<{
    processedData: {
      folders: FolderData["folders"];
      allCampaigns: Doc<"campaigns">[];
      filteredCampaigns: Doc<"campaigns">[];
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
    const campaignMap = new Map<Id<"campaigns">, Doc<"campaigns">>();
    let duplicateCount = 0;
    
    // Add campaigns from folders
    folderData.folders.forEach(folder => {
      folder.campaigns.forEach(campaign => {
        if (campaignMap.has(campaign._id)) {
          duplicateCount++;
        }
        campaignMap.set(campaign._id, campaign);
      });
    });
    
    // Add unorganized campaigns (won't overwrite if already exists)
    folderData.unorganizedCampaigns.forEach(campaign => {
      if (!campaignMap.has(campaign._id)) {
        campaignMap.set(campaign._id, campaign);
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
      b._creationTime - a._creationTime
    );

    // Create data summary directly from raw data
    const completedCampaigns = allCampaigns.filter(campaign => campaign.status === 'completed').length;
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
    let filteredCampaigns: Doc<"campaigns">[] = allCampaigns;

    if (selectedView !== 'all') {
      const selectedFolder = folderData.folders.find(folder => folder.id === selectedView);
      filteredCampaigns = selectedFolder ? selectedFolder.campaigns : [];
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

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filteredCampaigns = filteredCampaigns.filter(campaign => {
        const campaignDate = new Date(campaign._creationTime);
        
        switch (dateFilter) {
          case 'today':
            return campaignDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return campaignDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return campaignDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            return campaignDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Ensure filtered campaigns are also sorted chronologically (newest first)
    filteredCampaigns = filteredCampaigns.sort((a, b) => 
      b._creationTime - a._creationTime
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
  }, [folderData, selectedView, searchQuery, statusFilter, dateFilter]);
}