"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useEffect, useState, useRef } from "react";
import type { ClipperClip } from "../../shared/types/common.types";

export function usePresignedUrls(clips: ClipperClip[]) {
  const getThumbnailUrlsAction = useAction(api.app.clipperS3.getThumbnailUrls);
  const [clipsWithUrls, setClipsWithUrls] = useState<ClipperClip[]>(clips);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  // Keep a cache of thumbnail URLs we've already fetched
  const thumbnailCacheRef = useRef<Map<string, string>>(new Map());

  // Track loading state to prevent race conditions
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-progress loading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchUrls = async () => {
      if (clips.length === 0) {
        setClipsWithUrls([]);
        setIsLoading(false);
        setLoadedCount(0);
        loadingRef.current = false;
        return;
      }

      try {
        setError(null);

        // Create a Set of current clip thumbnail keys for quick lookup
        const currentThumbnailKeys = new Set(
          clips.filter(c => c.thumbnailKey).map(c => c.thumbnailKey!)
        );

        // Remove cached URLs for thumbnails that no longer exist
        for (const key of thumbnailCacheRef.current.keys()) {
          if (!currentThumbnailKeys.has(key)) {
            thumbnailCacheRef.current.delete(key);
          }
        }

        // Initialize clips with cached thumbnail URLs where available
        const initialClips = clips.map(clip => ({
          ...clip,
          thumbnailUrl: clip.thumbnailKey ? thumbnailCacheRef.current.get(clip.thumbnailKey) : undefined,
        }));

        setClipsWithUrls(initialClips);
        setIsLoading(false);

        // Count how many already have thumbnail URLs
        const alreadyLoaded = clips.filter(c =>
          c.thumbnailKey && thumbnailCacheRef.current.has(c.thumbnailKey)
        ).length;
        setLoadedCount(alreadyLoaded);

        // Only fetch URLs for clips that have thumbnails but don't have URLs yet
        const clipsNeedingUrls = clips.filter(c =>
          c.thumbnailKey && !thumbnailCacheRef.current.has(c.thumbnailKey)
        );

        if (clipsNeedingUrls.length === 0) {
          loadingRef.current = false;
          return; // All clips already have thumbnail URLs
        }

        loadingRef.current = true;

        // Process thumbnails in batches of 25 for faster loading
        const BATCH_SIZE = 25;
        let processedCount = 0;

        for (let i = 0; i < clipsNeedingUrls.length; i += BATCH_SIZE) {
          // Check if we've been aborted
          if (controller.signal.aborted) {
            loadingRef.current = false;
            return;
          }

          // Get the next batch of clips
          const batch = clipsNeedingUrls.slice(i, i + BATCH_SIZE);
          const batchKeys = batch
            .filter(clip => clip.thumbnailKey)
            .map(clip => clip.thumbnailKey!);

          if (batchKeys.length === 0) continue;

          // Fetch presigned URLs for the entire batch in parallel
          const urls = await getThumbnailUrlsAction({ keys: batchKeys });

          // Check again after async operation
          if (controller.signal.aborted) {
            loadingRef.current = false;
            return;
          }

          // Cache all URLs from this batch
          for (const urlResult of urls) {
            thumbnailCacheRef.current.set(urlResult.key, urlResult.thumbnailUrl);
          }

          // Update state with all thumbnail URLs from this batch
          setClipsWithUrls((prev) =>
            prev.map((c) => ({
              ...c,
              thumbnailUrl: c.thumbnailKey && !c.thumbnailUrl
                ? thumbnailCacheRef.current.get(c.thumbnailKey)
                : c.thumbnailUrl,
            }))
          );

          // Update progress
          processedCount += batch.length;
          setLoadedCount(alreadyLoaded + processedCount);
        }

        loadingRef.current = false;
      } catch (err) {
        if (controller.signal.aborted) {
          return; // Ignore errors from aborted requests
        }

        setError(
          err instanceof Error ? err : new Error("Failed to fetch thumbnail URLs")
        );
        // On error, return clips without thumbnail URLs
        setClipsWithUrls(clips);
        loadingRef.current = false;
      }
    };

    fetchUrls();

    return () => {
      controller.abort();
    };
  }, [clips, getThumbnailUrlsAction]);

  return {
    clips: clipsWithUrls,
    isLoading,
    error,
    loadedCount,
    totalCount: clips.length,
    progress: clips.length > 0 ? (loadedCount / clips.length) * 100 : 0,
  };
}
