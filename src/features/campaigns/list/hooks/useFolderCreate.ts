"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";

interface UseFolderCreateProps {
  folders?: any[];
}

export function useFolderCreate({ folders }: UseFolderCreateProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createFolderMutation = useMutation(api.folders.create);

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

  const isDuplicateName = (name: string, excludeId?: string): boolean => {
    if (!folders) return false;
    return folders.some(folder => 
      folder.name.toLowerCase() === name.toLowerCase() && 
      folder._id !== excludeId
    );
  };

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

  return {
    showCreateForm,
    setShowCreateForm,
    newFolderName,
    setNewFolderName,
    isCreating,
    handleCreateFolder,
    validateFolderName,
    isDuplicateName,
  };
}