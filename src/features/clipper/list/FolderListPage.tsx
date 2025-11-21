"use client";

import { useState } from "react";
import { useFolders } from "./hooks/useFolders";
import { ClipperFolderTable } from "./components/ClipperFolderTable";
import { CreateFolderDialog } from "./components/CreateFolderDialog";
import { ClipperHeader } from "../shared/components/ClipperHeader";
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
import type { FolderId } from "./types/clipper.types";

interface FolderToDelete {
  id: FolderId;
  name: string;
}

export function FolderListPage() {
  const [folderToDelete, setFolderToDelete] = useState<FolderToDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { folders, isLoading, createFolder, deleteFolder } = useFolders();

  const handleDeleteFolderClick = (folderId: FolderId, folderName: string) => {
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

  if (isLoading) {
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
            title="Clipper"
            description="Create folders and upload videos to generate clips"
          />
          <CreateFolderDialog onCreateFolder={createFolder} />
        </div>
        {folders && (
          <ClipperFolderTable
            folders={folders}
            onDeleteFolder={handleDeleteFolderClick}
          />
        )}
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
              delete all videos and clips in this folder. This action cannot be undone.
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
