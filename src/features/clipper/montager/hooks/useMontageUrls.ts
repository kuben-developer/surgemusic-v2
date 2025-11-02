"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Montage } from "../../shared/types/common.types";

export function useMontageUrls(montages: Montage[]) {
  const getThumbnailUrlsAction = useAction(api.app.montager.getMontagesThumbnailUrls);
  const [montagesWithUrls, setMontagesWithUrls] = useState<Montage[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadThumbnails = async () => {
      if (montages.length === 0) {
        setMontagesWithUrls([]);
        setLoadedCount(0);
        setTotalCount(0);
        return;
      }

      // Filter montages that have thumbnails
      const montagesWithThumbnails = montages.filter((m) => m.thumbnailKey);
      setTotalCount(montages.length);

      if (montagesWithThumbnails.length === 0) {
        // No thumbnails available, just set montages as-is
        setMontagesWithUrls(montages);
        setLoadedCount(montages.length);
        return;
      }

      try {
        // Batch load all thumbnail URLs at once
        const thumbnailKeys = montagesWithThumbnails.map((m) => m.thumbnailKey!);
        const thumbnailUrls = await getThumbnailUrlsAction({ keys: thumbnailKeys });

        // Create a map of thumbnail URLs
        const urlMap = new Map(
          thumbnailUrls.map((item) => [item.key, item.thumbnailUrl])
        );

        // Update montages with thumbnail URLs
        const updated = montages.map((montage) => {
          if (montage.thumbnailKey) {
            return {
              ...montage,
              thumbnailUrl: urlMap.get(montage.thumbnailKey),
            };
          }
          return montage;
        });

        setMontagesWithUrls(updated);
        setLoadedCount(updated.length);
      } catch (error) {
        console.error("Error loading thumbnail URLs:", error);
        // On error, just return montages without URLs
        setMontagesWithUrls(montages);
        setLoadedCount(montages.length);
      }
    };

    loadThumbnails();
  }, [montages, getThumbnailUrlsAction]);

  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;

  return {
    montages: montagesWithUrls,
    loadedCount,
    totalCount,
    progress,
  };
}
