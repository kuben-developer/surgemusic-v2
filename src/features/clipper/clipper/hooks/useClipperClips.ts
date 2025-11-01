"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useEffect, useState, useCallback } from "react";
import type { ClipperClip } from "../../shared/types/common.types";

export function useClipperClips(folderName: string | null) {
  const listClipsAction = useAction(api.app.clipper.listClips);
  const [clips, setClips] = useState<ClipperClip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClips = useCallback(async () => {
    if (!folderName) {
      setClips([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await listClipsAction({ folderName });
      setClips(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch clips"));
    } finally {
      setIsLoading(false);
    }
  }, [folderName, listClipsAction]);

  useEffect(() => {
    fetchClips();
  }, [fetchClips]);

  const removeClips = useCallback((keysToRemove: string[]) => {
    setClips((prev) => prev.filter((clip) => !keysToRemove.includes(clip.key)));
  }, []);

  return {
    clips,
    isLoading,
    error,
    refetch: fetchClips,
    removeClips,
  };
}
