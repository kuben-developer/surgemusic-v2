"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface UseFolderModifyProps {
  folders?: Doc<"folders">[];
  validateFolderName: (name: string) => string | null;
  isDuplicateName: (name: string, excludeId?: string) => boolean;
}

export function useFolderModify({ folders, validateFolderName, isDuplicateName }: UseFolderModifyProps) {
  // Rename folder state
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  
  // Delete folder state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateFolderMutation = useMutation(api.app.folders.update);
  const deleteFolderMutation = useMutation(api.app.folders.deleteFolder);

  const handleRenameFolder = async (selectedFolder: Doc<"folders">) => {
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
        id: selectedFolder._id, 
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

  const handleDeleteFolder = async (selectedFolder: Doc<"folders">) => {
    if (!selectedFolder) return;
    
    setIsDeleting(true);
    try {
      await deleteFolderMutation({ id: selectedFolder._id });
      setShowDeleteDialog(false);
      setIsDeleting(false);
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      setIsDeleting(false);
      toast.error("Failed to delete folder");
    }
  };

  return {
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
  };
}