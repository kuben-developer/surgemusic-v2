"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useEffect, useState, useRef } from "react";
import type { ClipperClip } from "../../shared/types/common.types";

export function usePresignedUrls(clips: ClipperClip[]) {
  const getPresignedUrlsAction = useAction(api.app.clipper.getPresignedUrls);
  const [clipsWithUrls, setClipsWithUrls] = useState<ClipperClip[]>(clips);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  // Keep a cache of URLs we've already fetched
  const urlCacheRef = useRef<Map<string, string>>(new Map());

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

        // Create a Set of current clip keys for quick lookup
        const currentClipKeys = new Set(clips.map(c => c.key));

        // Remove cached URLs for clips that no longer exist
        for (const key of urlCacheRef.current.keys()) {
          if (!currentClipKeys.has(key)) {
            urlCacheRef.current.delete(key);
          }
        }

        // Initialize clips with cached URLs where available
        const initialClips = clips.map(clip => ({
          ...clip,
          presignedUrl: urlCacheRef.current.get(clip.key),
        }));

        setClipsWithUrls(initialClips);
        setIsLoading(false);

        // Count how many already have URLs
        const alreadyLoaded = clips.filter(c => urlCacheRef.current.has(c.key)).length;
        setLoadedCount(alreadyLoaded);

        // Only fetch URLs for clips that don't have them yet
        const clipsNeedingUrls = clips.filter(c => !urlCacheRef.current.has(c.key));

        if (clipsNeedingUrls.length === 0) {
          loadingRef.current = false;
          return; // All clips already have URLs
        }

        loadingRef.current = true;

        // Process each clip one by one from top to bottom
        for (let i = 0; i < clipsNeedingUrls.length; i++) {
          // Check if we've been aborted
          if (controller.signal.aborted) {
            loadingRef.current = false;
            return;
          }

          const clip = clipsNeedingUrls[i];
          if (!clip) continue;

          // Fetch presigned URL for this single clip
          const urls = await getPresignedUrlsAction({ keys: [clip.key] });

          // Check again after async operation
          if (controller.signal.aborted) {
            loadingRef.current = false;
            return;
          }

          if (urls.length > 0 && urls[0]) {
            const presignedUrl = urls[0].presignedUrl;

            // Cache the URL
            urlCacheRef.current.set(clip.key, presignedUrl);

            // Update state with this clip's URL using the cache
            setClipsWithUrls((prev) =>
              prev.map((c) => ({
                ...c,
                presignedUrl: c.presignedUrl || urlCacheRef.current.get(c.key),
              }))
            );
          }

          // Update progress
          setLoadedCount(alreadyLoaded + i + 1);
        }

        loadingRef.current = false;
      } catch (err) {
        if (controller.signal.aborted) {
          return; // Ignore errors from aborted requests
        }

        setError(
          err instanceof Error ? err : new Error("Failed to fetch presigned URLs")
        );
        // On error, return clips without URLs
        setClipsWithUrls(clips);
        loadingRef.current = false;
      }
    };

    fetchUrls();

    return () => {
      controller.abort();
    };
  }, [clips, getPresignedUrlsAction]);

  return {
    clips: clipsWithUrls,
    isLoading,
    error,
    loadedCount,
    totalCount: clips.length,
    progress: clips.length > 0 ? (loadedCount / clips.length) * 100 : 0,
  };
}
