"use client";

import { useEffect, useRef } from "react";
import { CLIPS_PER_PAGE } from "../constants/clips.constants";
import type { ClipWithIndex } from "../types/clipper.types";

/**
 * Prefetches thumbnails for clips beyond the current page.
 * Uses the browser's Image API to load images in the background.
 */
export function useThumbnailPrefetch(
  clips: ClipWithIndex[],
  currentEndIndex: number
) {
  const prefetchedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Get clips for the next page(s) that haven't been prefetched yet
    const clipsToPreload = clips.slice(
      currentEndIndex,
      currentEndIndex + CLIPS_PER_PAGE
    );

    clipsToPreload.forEach((clip) => {
      if (!prefetchedUrls.current.has(clip.thumbnailUrl)) {
        const img = new Image();
        img.src = clip.thumbnailUrl;
        prefetchedUrls.current.add(clip.thumbnailUrl);
      }
    });
  }, [clips, currentEndIndex]);
}
