"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useEffect, useState, useCallback } from "react";
import type { Montage } from "../../shared/types/common.types";

export function useMontages(folderName: string | null) {
  const listMontagesAction = useAction(api.app.montager.listMontages);
  const [montages, setMontages] = useState<Montage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMontages = useCallback(async () => {
    if (!folderName) {
      setMontages([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await listMontagesAction({ folderName });
      setMontages(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch montages"));
    } finally {
      setIsLoading(false);
    }
  }, [folderName, listMontagesAction]);

  useEffect(() => {
    fetchMontages();
  }, [fetchMontages]);

  return {
    montages,
    isLoading,
    error,
    refetch: fetchMontages,
  };
}
