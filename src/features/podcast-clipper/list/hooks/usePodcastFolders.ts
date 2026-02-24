"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { PodcastFolderId } from "../../shared/types/podcast-clipper.types";

export function usePodcastFolders() {
  const folders = useQuery(api.app.podcastClipperDb.getFolders);
  const createFolderMutation = useMutation(api.app.podcastClipperDb.createFolder);
  const deleteFolderMutation = useMutation(api.app.podcastClipperDb.deleteFolder);

  const createFolder = async (folderName: string) => {
    try {
      await createFolderMutation({ folderName });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create folder";
      toast.error(message);
      throw error;
    }
  };

  const deleteFolder = async (folderId: PodcastFolderId) => {
    try {
      await deleteFolderMutation({ folderId });
      toast.success("Folder deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete folder";
      toast.error(message);
      throw error;
    }
  };

  return {
    folders,
    isLoading: folders === undefined,
    createFolder,
    deleteFolder,
  };
}
