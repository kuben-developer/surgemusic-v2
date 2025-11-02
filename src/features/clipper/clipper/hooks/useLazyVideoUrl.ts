"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useCallback, useRef } from "react";

/**
 * Hook to lazily fetch video URLs on demand
 * This is used when a user clicks on a thumbnail to play the video
 */
export function useLazyVideoUrl() {
  const getVideoUrlAction = useAction(api.app.clipper.getVideoUrl);
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<Error | null>(null);

  // Cache video URLs to avoid refetching
  const videoCacheRef = useRef<Map<string, string>>(new Map());

  const fetchVideoUrl = useCallback(
    async (key: string): Promise<string | null> => {
      // Return cached URL if available
      if (videoCacheRef.current.has(key)) {
        return videoCacheRef.current.get(key)!;
      }

      // Mark as loading
      setLoadingKeys((prev) => new Set(prev).add(key));
      setError(null);

      try {
        const videoUrl = await getVideoUrlAction({ key });

        // Cache the URL
        videoCacheRef.current.set(key, videoUrl);

        // Remove from loading
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });

        return videoUrl;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch video URL")
        );

        // Remove from loading
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });

        return null;
      }
    },
    [getVideoUrlAction]
  );

  const isLoading = useCallback(
    (key: string) => loadingKeys.has(key),
    [loadingKeys]
  );

  const getCachedUrl = useCallback((key: string) => {
    return videoCacheRef.current.get(key);
  }, []);

  return {
    fetchVideoUrl,
    isLoading,
    getCachedUrl,
    error,
  };
}
