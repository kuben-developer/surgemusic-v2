"use client";

import { useEffect, useState } from "react";

type ThumbnailState = "idle" | "loading" | "loaded" | "error";

// Simple in-memory cache shared across all instances
const thumbnailCache = new Map<string, string>();

export function useTikTokThumbnail(tiktokVideoId: string) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    () => thumbnailCache.get(tiktokVideoId) ?? null,
  );
  const [state, setState] = useState<ThumbnailState>(
    () => (thumbnailCache.has(tiktokVideoId) ? "loaded" : "idle"),
  );

  useEffect(() => {
    if (thumbnailCache.has(tiktokVideoId)) {
      setThumbnailUrl(thumbnailCache.get(tiktokVideoId)!);
      setState("loaded");
      return;
    }

    let cancelled = false;
    setState("loading");

    const fetchThumbnail = async () => {
      try {
        const response = await fetch(
          `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@/video/${tiktokVideoId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const url = data.thumbnail_url as string;

        if (!cancelled) {
          thumbnailCache.set(tiktokVideoId, url);
          setThumbnailUrl(url);
          setState("loaded");
        }
      } catch {
        if (!cancelled) {
          setState("error");
        }
      }
    };

    void fetchThumbnail();

    return () => {
      cancelled = true;
    };
  }, [tiktokVideoId]);

  return { thumbnailUrl, isLoading: state === "loading", hasError: state === "error" };
}
