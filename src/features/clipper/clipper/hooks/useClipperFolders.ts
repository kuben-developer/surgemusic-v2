"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useEffect, useState, useCallback } from "react";
import type { ClipperFolder } from "../../shared/types/common.types";

export function useClipperFolders() {
  const listFoldersAction = useAction(api.app.clipperS3.listFolders);
  const [folders, setFolders] = useState<ClipperFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await listFoldersAction();
      setFolders(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch folders"));
    } finally {
      setIsLoading(false);
    }
  }, [listFoldersAction]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return {
    folders,
    isLoading,
    error,
    refetch: fetchFolders,
  };
}
