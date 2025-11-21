"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { ClipperFolder, FolderId } from "../types/clipper.types";

export function useFolders() {
  const folders = useQuery(api.app.clipperDb.getFolders);
  const createFolderMutation = useMutation(api.app.clipperDb.createFolderDb);
  const deleteFolderMutation = useMutation(api.app.clipperDb.deleteFolderDb);

  const createFolder = async (folderName: string) => {
    return await createFolderMutation({ folderName });
  };

  const deleteFolder = async (folderId: FolderId) => {
    return await deleteFolderMutation({ folderId });
  };

  return {
    folders: folders as ClipperFolder[] | undefined,
    isLoading: folders === undefined,
    createFolder,
    deleteFolder,
  };
}
