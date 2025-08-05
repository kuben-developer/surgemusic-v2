"use client"

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useFolderData } from "./useFolderData";

interface UseFolderManagerLogicProps {
  open: boolean;
}

export function useFolderManagerLogic({ open }: UseFolderManagerLogicProps) {
  // State management
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());

  // Use useFolderData hook for data fetching
  const {
    folders,
    isLoading,
    allCampaigns,
    campaignsLoading,
    folderCampaigns,
    folderCampaignsLoading
  } = useFolderData({ isOpen: open, selectedFolderId });

  // Mutations
  const deleteFolderMutation = useMutation(api.folders.deleteFolder);
  const addCampaignsMutation = useMutation(api.folders.addCampaigns);
  const removeCampaignMutation = useMutation(api.folders.removeCampaign);

  // Derived data
  const selectedFolder = folders?.find(folder => folder._id === selectedFolderId);

  // State management functions
  const resetState = () => {
    setSelectedFolderId(null);
    setShowDeleteDialog(false);
    setCampaignSearchQuery("");
    setSelectedCampaignIds(new Set());
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    setSelectedCampaignIds(new Set());
  };

  // Folder operations
  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;
    
    setIsDeleting(true);
    try {
      await deleteFolderMutation({ id: selectedFolder._id as Id<"folders"> });
      setSelectedFolderId(null);
      setShowDeleteDialog(false);
      setIsDeleting(false);
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      setIsDeleting(false);
      toast.error("❌ Failed to delete folder");
    }
  };

  // Campaign operations
  const handleRemoveCampaign = async (campaignId: string) => {
    if (!selectedFolderId) return;
    
    try {
      await removeCampaignMutation({
        folderId: selectedFolderId as Id<"folders">,
        campaignId: campaignId as Id<"campaigns">,
      });
      toast.success("Campaign removed successfully");
    } catch (error) {
      console.error("Failed to remove campaign from folder:", error);
      toast.error("❌ Failed to remove campaign");
    }
  };

  const handleCampaignSelect = (campaignId: string, checked: boolean) => {
    const newSelected = new Set(selectedCampaignIds);
    if (checked) {
      newSelected.add(campaignId);
    } else {
      newSelected.delete(campaignId);
    }
    setSelectedCampaignIds(newSelected);
  };

  const handleSelectAllCampaigns = (checked: boolean) => {
    if (checked && allCampaigns && folderCampaigns) {
      // Filter available campaigns (exclude those already in folder)
      const folderCampaignIds = new Set(folderCampaigns.campaigns?.map(c => c._id) || []);
      const availableCampaigns = allCampaigns.filter(campaign => !folderCampaignIds.has(campaign._id));
      setSelectedCampaignIds(new Set(availableCampaigns.map(c => c._id)));
    } else {
      setSelectedCampaignIds(new Set());
    }
  };

  const handleBulkAddCampaigns = async () => {
    if (!selectedFolderId || selectedCampaignIds.size === 0) return;
    
    try {
      await addCampaignsMutation({
        folderId: selectedFolderId as Id<"folders">,
        campaignIds: Array.from(selectedCampaignIds) as Id<"campaigns">[],
      });
      setSelectedCampaignIds(new Set());
      toast.success("Campaigns added successfully");
    } catch (error) {
      console.error("Failed to add campaigns:", error);
      toast.error("❌ Failed to add campaigns");
    }
  };

  return {
    // State
    selectedFolderId,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    campaignSearchQuery,
    setCampaignSearchQuery,
    selectedCampaignIds,

    // Data
    folders,
    isLoading,
    allCampaigns,
    campaignsLoading,
    folderCampaigns,
    folderCampaignsLoading,
    selectedFolder,

    // Actions
    resetState,
    handleFolderSelect,
    handleDeleteFolder,
    handleRemoveCampaign,
    handleCampaignSelect,
    handleSelectAllCampaigns,
    handleBulkAddCampaigns,
  };
}