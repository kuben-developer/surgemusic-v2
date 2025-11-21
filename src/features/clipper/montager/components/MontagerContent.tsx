"use client";

import { useState } from "react";
import { ClipperHeader } from "../../shared/components/ClipperHeader";
import { MontagerFolderTable } from "./MontagerFolderTable";
import { CreateMontagerFolderButton } from "./CreateMontagerFolderButton";
import { useMontagerFolders } from "../hooks/useMontagerFolders";
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
import type { MontagerFolderId } from "../../shared/types/common.types";

interface FolderToDelete {
  id: MontagerFolderId;
  name: string;
}

export function MontagerContent() {
  const [folderToDelete, setFolderToDelete] = useState<FolderToDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { folders, isLoading: foldersLoading, deleteFolder } = useMontagerFolders();

  const handleDeleteFolderClick = (folderId: MontagerFolderId, folderName: string) => {
    setFolderToDelete({ id: folderId, name: folderName });
  };

  const handleDeleteFolderConfirm = async () => {
    if (!folderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFolder(folderToDelete.id);
      setFolderToDelete(null);
    } catch (error) {
      // Error already handled in hook with toast
    } finally {
      setIsDeleting(false);
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
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <ClipperHeader
            title="Montager"
            description="Create video montages by combining clips from your clipper folders"
          />
          <CreateMontagerFolderButton />
        </div>
        <MontagerFolderTable
          folders={folders}
          onDeleteFolder={handleDeleteFolderClick}
        />
      </div>

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog
        open={folderToDelete !== null}
        onOpenChange={(open) => !open && setFolderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{folderToDelete?.name}&quot;? This will permanently
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
