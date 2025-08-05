"use client";

import { useCallback } from "react";
import type { Folder } from "../types/folder-sidebar.types";

interface UseFolderSidebarProps {
  folders?: Folder[];
  isLoading: boolean;
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  isCreating: boolean;
  onCreateFolder: () => Promise<void>;
}

interface UseFolderSidebarReturn {
  // Folder selection
  handleFolderSelect: (folderId: string) => void;
  
  // Create folder form
  handleShowCreateForm: () => void;
  handleHideCreateForm: () => void;
  handleCreateFolder: () => Promise<void>;
  handleNewFolderNameChange: (name: string) => void;
  handleCreateFormKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  
  // Computed values
  folderCount: number;
  hasNoFolders: boolean;
  canCreateFolder: boolean;
}

export function useFolderSidebar({
  folders,
  isLoading,
  selectedFolderId,
  onFolderSelect,
  showCreateForm,
  setShowCreateForm,
  newFolderName,
  setNewFolderName,
  isCreating,
  onCreateFolder,
}: UseFolderSidebarProps): UseFolderSidebarReturn {
  
  const handleFolderSelect = useCallback((folderId: string) => {
    onFolderSelect(folderId);
  }, [onFolderSelect]);

  const handleShowCreateForm = useCallback(() => {
    setShowCreateForm(true);
  }, [setShowCreateForm]);

  const handleHideCreateForm = useCallback(() => {
    setShowCreateForm(false);
    setNewFolderName("");
  }, [setShowCreateForm, setNewFolderName]);

  const handleCreateFolder = useCallback(async () => {
    if (newFolderName.trim() && !isCreating) {
      await onCreateFolder();
    }
  }, [newFolderName, isCreating, onCreateFolder]);

  const handleNewFolderNameChange = useCallback((name: string) => {
    setNewFolderName(name);
  }, [setNewFolderName]);

  const handleCreateFormKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newFolderName.trim()) {
      handleCreateFolder();
    } else if (e.key === 'Escape') {
      handleHideCreateForm();
    }
  }, [newFolderName, handleCreateFolder, handleHideCreateForm]);

  // Computed values
  const folderCount = folders?.length || 0;
  const hasNoFolders = !isLoading && (!folders || folders.length === 0);
  const canCreateFolder = Boolean(newFolderName.trim()) && !isCreating;

  return {
    handleFolderSelect,
    handleShowCreateForm,
    handleHideCreateForm,
    handleCreateFolder,
    handleNewFolderNameChange,
    handleCreateFormKeyDown,
    folderCount,
    hasNoFolders,
    canCreateFolder,
  };
}