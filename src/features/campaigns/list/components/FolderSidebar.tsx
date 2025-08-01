"use client";

import { FolderSidebarHeader } from "./FolderSidebarHeader";
import { FolderCreateForm } from "./FolderCreateForm";
import { FolderList } from "./FolderList";
import { useFolderSidebar } from "../hooks/useFolderSidebar";
import type { FolderSidebarProps } from "../types/folder-sidebar.types";

export function FolderSidebar({
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
}: FolderSidebarProps) {
  const {
    handleFolderSelect,
    handleShowCreateForm,
    handleHideCreateForm,
    handleCreateFolder,
    handleNewFolderNameChange,
    handleCreateFormKeyDown,
    folderCount,
    hasNoFolders,
    canCreateFolder,
  } = useFolderSidebar({
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
  });

  return (
    <div className="w-80 border-r bg-muted/30">
      {!showCreateForm ? (
        <FolderSidebarHeader
          folderCount={folderCount}
          showCreateForm={showCreateForm}
          onShowCreateForm={handleShowCreateForm}
        />
      ) : (
        <FolderCreateForm
          newFolderName={newFolderName}
          isCreating={isCreating}
          canCreateFolder={canCreateFolder}
          onNewFolderNameChange={handleNewFolderNameChange}
          onCreateFolder={handleCreateFolder}
          onHideCreateForm={handleHideCreateForm}
          onKeyDown={handleCreateFormKeyDown}
        />
      )}
      
      <FolderList
        folders={folders}
        isLoading={isLoading}
        selectedFolderId={selectedFolderId}
        hasNoFolders={hasNoFolders}
        onFolderSelect={handleFolderSelect}
      />
    </div>
  );
}