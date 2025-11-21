"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Video, Film, Trash2, Loader2 } from "lucide-react";
import type { ClipperFolder, FolderId } from "../types/clipper.types";
import { useState } from "react";
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
import { toast } from "sonner";

interface FolderGridProps {
  folders: ClipperFolder[];
  onDeleteFolder: (folderId: FolderId) => Promise<unknown>;
}

export function FolderGrid({ folders, onDeleteFolder }: FolderGridProps) {
  const [deletingFolderId, setDeletingFolderId] = useState<FolderId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, folderId: FolderId) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingFolderId(folderId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFolderId) return;

    setIsDeleting(true);
    try {
      await onDeleteFolder(deletingFolderId);
      toast.success("Folder deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete folder";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setDeletingFolderId(null);
    }
  };

  if (folders.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No folders yet</h3>
        <p className="text-muted-foreground">Create a folder to start uploading videos.</p>
      </div>
    );
  }

  const folderToDelete = folders.find((f) => f._id === deletingFolderId);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <Link key={folder._id} href={`/clipper/${folder._id}`}>
            <Card className="cursor-pointer hover:border-primary transition-colors group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base truncate">{folder.folderName}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteClick(e, folder._id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    {folder.videoCount} {folder.videoCount === 1 ? "video" : "videos"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Film className="h-4 w-4" />
                    {folder.clipCount} {folder.clipCount === 1 ? "clip" : "clips"}
                  </span>
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <AlertDialog open={!!deletingFolderId} onOpenChange={() => setDeletingFolderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{folderToDelete?.folderName}&quot;?
              This will permanently delete the folder and all {folderToDelete?.videoCount || 0} videos in it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
