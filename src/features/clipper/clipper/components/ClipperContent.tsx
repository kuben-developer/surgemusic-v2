"use client";

import { useState } from "react";
import { ClipperHeader } from "../../shared/components/ClipperHeader";
import { FolderTable } from "./FolderTable";
import { CreateFolderButton } from "./CreateFolderButton";
import { UploadDialog } from "./UploadDialog";
import { ClipsToolbar } from "./ClipsToolbar";
import { ClipsGrid } from "./ClipsGrid";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useClipperFolders } from "../hooks/useClipperFolders";
import { useClipperClips } from "../hooks/useClipperClips";
import { useVideoUpload } from "../hooks/useVideoUpload";
import { useClipSelection } from "../hooks/useClipSelection";
import { useClipsSorting } from "../hooks/useClipsSorting";
import { usePresignedUrls } from "../hooks/usePresignedUrls";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { SortField } from "../../shared/types/common.types";

export function ClipperContent() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);

  const { folders, isLoading: foldersLoading, refetch: refetchFolders } = useClipperFolders();
  const { clips, isLoading: clipsLoading, refetch: refetchClips, removeClips } = useClipperClips(selectedFolder);
  const { uploads, uploadFiles, isUploading, clearUploads } = useVideoUpload(selectedFolder, {
    onUploadComplete: refetchFolders,
  });
  const {
    selectedKeys,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
  } = useClipSelection();
  const { sortedClips, sortOptions, setSortField } = useClipsSorting(clips);

  // Fetch presigned URLs for all clips (loads one by one)
  const { clips: clipsWithUrls, loadedCount, totalCount, progress } = usePresignedUrls(sortedClips);

  const deleteClipsAction = useAction(api.app.clipper.deleteClips);
  const deleteFolderAction = useAction(api.app.clipper.deleteFolder);

  const handleFolderSelect = (folderName: string) => {
    setSelectedFolder(folderName);
    clearSelection();
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    clearSelection();
    refetchFolders();
  };

  const handleSortChange = (field: SortField) => {
    setSortField(field);
  };

  const handleDeleteClick = () => {
    if (selectedCount > 0) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedKeys.length === 0) return;

    setIsDeleting(true);
    try {
      const result = await deleteClipsAction({ keys: selectedKeys });
      if (result.success) {
        toast.success(result.message);
        // Remove clips from local state without refetching
        removeClips(selectedKeys);
        clearSelection();
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete clips"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    await uploadFiles(files);
  };

  const handleDeleteFolderClick = (folderName: string) => {
    setFolderToDelete(folderName);
    setIsDeleteFolderDialogOpen(true);
  };

  const handleDeleteFolderConfirm = async () => {
    if (!folderToDelete) return;

    setIsDeletingFolder(true);
    try {
      const result = await deleteFolderAction({ folderName: folderToDelete });
      if (result.success) {
        toast.success(result.message);
        setIsDeleteFolderDialogOpen(false);
        setFolderToDelete(null);
        refetchFolders();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete folder"
      );
    } finally {
      setIsDeletingFolder(false);
    }
  };

  if (foldersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!selectedFolder ? (
        // Folder View
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <ClipperHeader
              title="Clipper"
              description="Upload videos and they'll be automatically split into 1-second clips with quality metrics"
            />
            <CreateFolderButton onFolderCreated={refetchFolders} />
          </div>
          <FolderTable
            folders={folders}
            onSelectFolder={handleFolderSelect}
            onDeleteFolder={handleDeleteFolderClick}
          />
        </div>
      ) : (
        // Clips View
        <div className="space-y-6">
          <ClipsToolbar
            onBack={handleBackToFolders}
            selectedCount={selectedCount}
            totalCount={totalCount}
            onDelete={handleDeleteClick}
            sortOptions={sortOptions}
            onSortChange={handleSortChange}
            onUpload={() => setIsUploadDialogOpen(true)}
            onRefresh={refetchClips}
            autoplay={autoplay}
            onToggleAutoplay={() => setAutoplay(!autoplay)}
            folderName={selectedFolder}
          />

          {/* Clips Grid */}
          {clipsLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <ClipsGrid
              clips={clipsWithUrls}
              selectedKeys={selectedKeys}
              onToggleSelection={toggleSelection}
              onSelectAll={() => selectAll(clipsWithUrls.map((c) => c.key))}
              onClearSelection={clearSelection}
              loadedCount={loadedCount}
              totalCount={totalCount}
              progress={progress}
              autoplay={autoplay}
            />
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onFilesSelected={handleFilesSelected}
        uploads={uploads}
        isUploading={isUploading}
        onClearUploads={clearUploads}
      />

      {/* Delete Clips Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        count={selectedCount}
        isDeleting={isDeleting}
      />

      {/* Delete Folder Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteFolderDialogOpen}
        onOpenChange={setIsDeleteFolderDialogOpen}
        onConfirm={handleDeleteFolderConfirm}
        count={1}
        isDeleting={isDeletingFolder}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folderToDelete}"? This will permanently delete all videos and clips in this folder. This action cannot be undone.`}
      />
    </div>
  );
}
