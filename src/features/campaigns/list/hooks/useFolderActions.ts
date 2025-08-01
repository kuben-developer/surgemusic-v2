"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface UseFolderActionsProps {
  folders?: any[];
}

interface UseFolderActionsReturn {
  // Create folder state
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  isCreating: boolean;
  handleCreateFolder: () => Promise<void>;
  
  // Rename folder state
  showRenameForm: boolean;
  setShowRenameForm: (show: boolean) => void;
  renameFolderName: string;
  setRenameFolderName: (name: string) => void;
  isRenaming: boolean;
  handleRenameFolder: (selectedFolder: any) => Promise<void>;
  
  // Delete folder state
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  isDeleting: boolean;
  handleDeleteFolder: (selectedFolder: any) => Promise<void>;
  
  // Campaign actions
  handleAddCampaign: (campaignId: string, selectedFolderId: string) => Promise<void>;
  handleRemoveCampaign: (campaignId: string, selectedFolderId: string) => Promise<void>;
  handleBulkAddCampaigns: (campaignIds: string[], selectedFolderId: string) => Promise<void>;
  
  // Validation helpers
  validateFolderName: (name: string) => string | null;
  isDuplicateName: (name: string, excludeId?: string) => boolean;
}

export function useFolderActions({ folders }: UseFolderActionsProps): UseFolderActionsReturn {
  // Create folder state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Rename folder state
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  
  // Delete folder state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Convex mutations
  const createFolderMutation = useMutation(api.folders.create);
  const updateFolderMutation = useMutation(api.folders.update);
  const deleteFolderMutation = useMutation(api.folders.deleteFolder);
  const addCampaignMutation = useMutation(api.folders.addCampaign);
  const addCampaignsMutation = useMutation(api.folders.addCampaigns);
  const removeCampaignMutation = useMutation(api.folders.removeCampaign);

  // Validation helper
  const validateFolderName = (name: string): string | null => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return "Folder name cannot be empty.";
    }
    if (trimmedName.length > 100) {
      return "Folder name must be less than 100 characters.";
    }
    return null;
  };

  // Check for duplicate folder names
  const isDuplicateName = (name: string, excludeId?: string): boolean => {
    if (!folders) return false;
    return folders.some(folder => 
      folder.name.toLowerCase() === name.toLowerCase() && 
      folder._id !== excludeId
    );
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    const validationError = validateFolderName(newFolderName);
    if (validationError) {
      toast.error("Invalid folder name", {
        description: validationError,
      });
      return;
    }

    if (isDuplicateName(newFolderName.trim())) {
      toast.error("Duplicate folder name", {
        description: "A folder with this name already exists.",
      });
      return;
    }
    
    setIsCreating(true);
    try {
      await createFolderMutation({ name: newFolderName.trim() });
      setNewFolderName("");
      setShowCreateForm(false);
      setIsCreating(false);
      toast.success("Folder created successfully");
    } catch (error) {
      console.error("Failed to create folder:", error);
      setIsCreating(false);
      toast.error("Failed to create folder");
    }
  };

  // Handle folder renaming
  const handleRenameFolder = async (selectedFolder: any) => {
    if (!selectedFolder) return;

    const validationError = validateFolderName(renameFolderName);
    if (validationError) {
      toast.error("Invalid folder name", {
        description: validationError,
      });
      return;
    }

    if (isDuplicateName(renameFolderName.trim(), selectedFolder._id)) {
      toast.error("Duplicate folder name", {
        description: "A folder with this name already exists.",
      });
      return;
    }
    
    setIsRenaming(true);
    try {
      await updateFolderMutation({ 
        id: selectedFolder._id as Id<"folders">, 
        name: renameFolderName.trim() 
      });
      setRenameFolderName("");
      setIsRenaming(false);
      setShowRenameForm(false);
      toast.success("Folder renamed successfully");
    } catch (error) {
      console.error("Failed to update folder:", error);
      setIsRenaming(false);
      toast.error("Failed to rename folder");
    }
  };

  // Handle folder deletion
  const handleDeleteFolder = async (selectedFolder: any) => {
    if (!selectedFolder) return;
    
    setIsDeleting(true);
    try {
      await deleteFolderMutation({ id: selectedFolder._id as Id<"folders"> });
      setShowDeleteDialog(false);
      setIsDeleting(false);
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      setIsDeleting(false);
      toast.error("Failed to delete folder");
    }
  };

  // Handle adding campaign to folder
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

  // Handle removing campaign from folder
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

  // Handle bulk add campaigns
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
    // Create folder
    showCreateForm,
    setShowCreateForm,
    newFolderName,
    setNewFolderName,
    isCreating,
    handleCreateFolder,
    
    // Rename folder
    showRenameForm,
    setShowRenameForm,
    renameFolderName,
    setRenameFolderName,
    isRenaming,
    handleRenameFolder,
    
    // Delete folder
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleDeleteFolder,
    
    // Campaign actions
    handleAddCampaign,
    handleRemoveCampaign,
    handleBulkAddCampaigns,
    
    // Validation helpers
    validateFolderName,
    isDuplicateName,
  };
}