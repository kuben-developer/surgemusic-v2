"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ClipperHeader } from "../../shared/components/ClipperHeader";
import { MontagerFolderTable } from "./MontagerFolderTable";
import { CreateMontagerFolderButton } from "./CreateMontagerFolderButton";
import { MontagesToolbar } from "./MontagesToolbar";
import { MontagesGrid } from "./MontagesGrid";
import { MontageConfigDialog } from "./MontageConfigDialog";
import { useMontagerFolders } from "../hooks/useMontagerFolders";
import { useMontages } from "../hooks/useMontages";
import { useMontageUrls } from "../hooks/useMontageUrls";
import { useDownloadAllMontages } from "../hooks/useDownloadAllMontages";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MontagerContent() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { folders, isLoading: foldersLoading, refetch: refetchFolders } = useMontagerFolders();
  const { montages, isLoading: montagesLoading, refetch: refetchMontages } = useMontages(selectedFolder);
  const { montages: montagesWithUrls, loadedCount, totalCount, progress } = useMontageUrls(montages);
  const { downloadAll, isDownloading, progress: downloadProgress } = useDownloadAllMontages();

  const deleteFolderAction = useAction(api.app.montager.deleteMontagerFolder);

  const handleFolderSelect = (folderName: string) => {
    setSelectedFolder(folderName);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    refetchFolders();
  };

  const handleDeleteFolderClick = (folderName: string) => {
    setFolderToDelete(folderName);
  };

  const handleDeleteFolderConfirm = async () => {
    if (!folderToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteFolderAction({ folderName: folderToDelete });
      if (result.success) {
        toast.success(result.message);
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
      setIsDeleting(false);
    }
  };

  const handleConfigSuccess = () => {
    refetchMontages();
  };

  const handleDownloadAll = async () => {
    if (!selectedFolder || montagesWithUrls.length === 0) return;

    try {
      await downloadAll(montagesWithUrls, selectedFolder);
      toast.success(`Successfully downloaded ${montagesWithUrls.length} montages`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download montages"
      );
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
              title="Montager"
              description="Create video montages by combining clips from your clipper folders"
            />
            <CreateMontagerFolderButton onFolderCreated={refetchFolders} />
          </div>
          <MontagerFolderTable
            folders={folders}
            onSelectFolder={handleFolderSelect}
            onDeleteFolder={handleDeleteFolderClick}
          />
        </div>
      ) : (
        // Montages View
        <div className="space-y-6">
          <MontagesToolbar
            folderName={selectedFolder}
            onBack={handleBackToFolders}
            onRefresh={refetchMontages}
            onCreateConfig={() => setIsConfigDialogOpen(true)}
            onDownloadAll={handleDownloadAll}
            totalCount={totalCount}
            isDownloading={isDownloading}
            downloadProgress={downloadProgress}
          />

          {/* Montages Grid */}
          {montagesLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <MontagesGrid
              montages={montagesWithUrls}
              loadedCount={loadedCount}
              totalCount={totalCount}
              progress={progress}
            />
          )}
        </div>
      )}

      {/* Config Creation Dialog */}
      {selectedFolder && (
        <MontageConfigDialog
          open={isConfigDialogOpen}
          onOpenChange={setIsConfigDialogOpen}
          folderName={selectedFolder}
          onSuccess={handleConfigSuccess}
        />
      )}

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog
        open={folderToDelete !== null}
        onOpenChange={(open) => !open && setFolderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{folderToDelete}"? This will permanently
              delete all montages and configurations in this folder. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolderConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
