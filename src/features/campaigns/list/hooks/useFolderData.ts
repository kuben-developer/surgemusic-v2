"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface UseFolderDataProps {
  isOpen: boolean;
  selectedFolderId: string | null;
}

interface UseFolderDataReturn {
  folders: any[] | undefined;
  isLoading: boolean;
  allCampaigns: any[] | undefined;
  campaignsLoading: boolean;
  folderCampaigns: any;
  folderCampaignsLoading: boolean;
}

export function useFolderData({ 
  isOpen, 
  selectedFolderId 
}: UseFolderDataProps): UseFolderDataReturn {
  // Fetch folders using Convex
  const folders = useQuery(api.folders.list, isOpen ? {} : "skip");
  const isLoading = folders === undefined;

  // Fetch all campaigns for search and assignment
  const allCampaigns = useQuery(api.campaigns.getAll, isOpen ? {} : "skip");
  const campaignsLoading = allCampaigns === undefined;

  // Fetch campaigns in the selected folder
  const folderCampaigns = useQuery(
    api.folders.getCampaigns, 
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