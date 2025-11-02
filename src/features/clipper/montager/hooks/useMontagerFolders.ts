"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useEffect, useState, useCallback } from "react";
import type { MontagerFolder } from "../../shared/types/common.types";

export function useMontagerFolders() {
  const listFoldersAction = useAction(api.app.montager.listMontagerFolders);
  const [folders, setFolders] = useState<MontagerFolder[]>([]);
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
