"use client";

import { useState } from "react";
import { ClipperHeader } from "../../shared/components/ClipperHeader";
import { FolderCards } from "./FolderCards";
import { CreateFolderCard } from "./CreateFolderCard";
import { VideoUploader } from "./VideoUploader";
import { UploadProgress } from "./UploadProgress";
import { ClipsToolbar } from "./ClipsToolbar";
import { ClipsGrid } from "./ClipsGrid";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useClipperFolders } from "../hooks/useClipperFolders";
import { useClipperClips } from "../hooks/useClipperClips";
import { useVideoUpload } from "../hooks/useVideoUpload";
import { useClipSelection } from "../hooks/useClipSelection";
import { useClipsSorting } from "../hooks/useClipsSorting";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ClipperContent() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { folders, isLoading: foldersLoading, refetch: refetchFolders } = useClipperFolders();
  const { clips, isLoading: clipsLoading, refetch: refetchClips } = useClipperClips(selectedFolder);
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
  const deleteClipsAction = useAction(api.app.clipper.deleteClips);

  const handleFolderSelect = (folderName: string) => {
    setSelectedFolder(folderName);
    clearSelection();
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    clearSelection();
    refetchFolders();
  };

  const handleSortChange = (value: string) => {
    const [field] = value.split("-");
    setSortField(field as "clarity" | "brightness" | "date" | "name");
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
        clearSelection();
        refetchClips();
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
          <ClipperHeader
            title="Clipper"
            description="Upload videos and they'll be automatically split into 1-second clips with quality metrics"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <CreateFolderCard onFolderCreated={refetchFolders} />
            <FolderCards
              folders={folders}
              onSelectFolder={handleFolderSelect}
            />
          </div>
        </div>
      ) : (
        // Clips View
        <div className="space-y-6">
          <ClipsToolbar
            onBack={handleBackToFolders}
            selectedCount={selectedCount}
            onDelete={handleDeleteClick}
            sortOptions={sortOptions}
            onSortChange={handleSortChange}
            folderName={selectedFolder}
          />

          {/* Upload Section */}
          <div className="space-y-4">
            <VideoUploader
              onFilesSelected={handleFilesSelected}
              disabled={isUploading}
            />
            {uploads.length > 0 && (
              <UploadProgress uploads={uploads} onClear={clearUploads} />
            )}
          </div>

          {/* Clips Grid */}
          {clipsLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <ClipsGrid
              clips={sortedClips}
              selectedKeys={selectedKeys}
              onToggleSelection={toggleSelection}
              onSelectAll={() => selectAll(clips.map((c) => c.key))}
              onClearSelection={clearSelection}
            />
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        count={selectedCount}
        isDeleting={isDeleting}
      />
    </div>
  );
}
