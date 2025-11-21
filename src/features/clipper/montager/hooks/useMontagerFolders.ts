"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { MontagerFolderId } from "../../shared/types/common.types";

export function useMontagerFolders() {
  const folders = useQuery(api.app.montagerDb.getFolders);
  const createFolderMutation = useMutation(api.app.montagerDb.createFolderDb);
  const deleteFolderMutation = useMutation(api.app.montagerDb.deleteFolderDb);

  const isLoading = folders === undefined;

  const createFolder = async (folderName: string) => {
    try {
      const folderId = await createFolderMutation({ folderName });
      toast.success(`Folder "${folderName}" created successfully`);
      return folderId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create folder";
      toast.error(message);
      throw error;
    }
  };

  const deleteFolder = async (folderId: MontagerFolderId) => {
    try {
      await deleteFolderMutation({ folderId });
      toast.success("Folder deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete folder";
      toast.error(message);
      throw error;
    }
  };

  return {
    folders: folders ?? [],
    isLoading,
    createFolder,
    deleteFolder,
  };
}
