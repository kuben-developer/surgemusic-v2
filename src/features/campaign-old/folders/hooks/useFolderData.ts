"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../../convex/_generated/dataModel";

interface UseFolderDataProps {
  isOpen: boolean;
  selectedFolderId: string | null;
}

interface FolderCampaignsData {
  campaigns: (Doc<"campaigns"> & { videoCount: number })[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface UseFolderDataReturn {
  folders: Doc<"folders">[] | undefined;
  isLoading: boolean;
  allCampaigns: Doc<"campaigns">[] | undefined;
  campaignsLoading: boolean;
  folderCampaigns: FolderCampaignsData | undefined;
  folderCampaignsLoading: boolean;
}

export function useFolderData({ 
  isOpen, 
  selectedFolderId 
}: UseFolderDataProps): UseFolderDataReturn {
  // Fetch folders using Convex
  const folders = useQuery(api.app.folders.list, isOpen ? {} : "skip");
  const isLoading = folders === undefined;

  // Fetch all campaigns for search and assignment
  const allCampaigns = useQuery(api.app.campaigns.getAll, isOpen ? {} : "skip");
  const campaignsLoading = allCampaigns === undefined;

  // Fetch campaigns in the selected folder
  const folderCampaigns = useQuery(
    api.app.folders.getCampaigns, 
    isOpen && selectedFolderId 
      ? { folderId: selectedFolderId as Id<"folders">, page: 1, limit: 100 } 
      : "skip"
  );
  const folderCampaignsLoading = folderCampaigns === undefined;

  return {
    folders,
    isLoading,
    allCampaigns,
    campaignsLoading,
    folderCampaigns,
    folderCampaignsLoading,
  };
}