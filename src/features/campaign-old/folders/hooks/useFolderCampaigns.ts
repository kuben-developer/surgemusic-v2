"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useFolderCampaigns() {
  const addCampaignMutation = useMutation(api.app.folders.addCampaign);
  const addCampaignsMutation = useMutation(api.app.folders.addCampaigns);
  const removeCampaignMutation = useMutation(api.app.folders.removeCampaign);

  const handleAddCampaign = async (campaignId: string, selectedFolderId: string) => {
    try {
      await addCampaignMutation({
        folderId: selectedFolderId as Id<"folders">,
        campaignId: campaignId as Id<"campaigns">,
      });
      toast.success("Campaign added successfully");
    } catch (error) {
      console.error("Failed to add campaign to folder:", error);
      toast.error("Failed to add campaign");
    }
  };

  const handleRemoveCampaign = async (campaignId: string, selectedFolderId: string) => {
    try {
      await removeCampaignMutation({
        folderId: selectedFolderId as Id<"folders">,
        campaignId: campaignId as Id<"campaigns">,
      });
      toast.success("Campaign removed successfully");
    } catch (error) {
      console.error("Failed to remove campaign from folder:", error);
      toast.error("Failed to remove campaign");
    }
  };

  const handleBulkAddCampaigns = async (campaignIds: string[], selectedFolderId: string) => {
    try {
      await addCampaignsMutation({
        folderId: selectedFolderId as Id<"folders">,
        campaignIds: campaignIds as Id<"campaigns">[],
      });
      toast.success("Campaigns added successfully");
    } catch (error) {
      console.error("Failed to add campaigns:", error);
      toast.error("Failed to add campaigns");
    }
  };

  return {
    handleAddCampaign,
    handleRemoveCampaign,
    handleBulkAddCampaigns,
  };
}