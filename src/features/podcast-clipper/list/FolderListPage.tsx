"use client";

import { useState } from "react";
import { usePodcastFolders } from "./hooks/usePodcastFolders";
import { FolderTable } from "./components/FolderTable";
import { CreateFolderDialog } from "./components/CreateFolderDialog";
import { Loader2, Headphones } from "lucide-react";
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
import type { PodcastFolderId } from "../shared/types/podcast-clipper.types";

interface FolderToDelete {
  id: PodcastFolderId;
  name: string;
}

export function FolderListPage() {
  const [folderToDelete, setFolderToDelete] = useState<FolderToDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { folders, isLoading, createFolder, deleteFolder } = usePodcastFolders();

  const handleDeleteFolderClick = (folderId: PodcastFolderId, folderName: string) => {
    setFolderToDelete({ id: folderId, name: folderName });
  };

  const handleDeleteFolderConfirm = async () => {
    if (!folderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteFolder(folderToDelete.id);
      setFolderToDelete(null);
    } catch {
      // Error handled in hook
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
          <div>
            <div className="flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Podcast Clipper</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Reframe landscape podcast videos to portrait format with smart camera angle detection
            </p>
          </div>
          <CreateFolderDialog onCreateFolder={createFolder} />
        </div>
        {folders && (
          <FolderTable
            folders={folders}
            onDeleteFolder={handleDeleteFolderClick}
          />
        )}
      </div>

      <AlertDialog
        open={folderToDelete !== null}
        onOpenChange={(open) => !open && setFolderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{folderToDelete?.name}&quot;? This will permanently
              delete all videos, scene types, and configurations. This action cannot be undone.
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
