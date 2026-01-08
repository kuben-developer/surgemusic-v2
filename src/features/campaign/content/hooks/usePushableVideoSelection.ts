"use client";

import { useState, useCallback } from "react";

export interface ContentSample {
  videoUrl: string;
  thumbnailUrl: string;
  sourceVideoId?: string;
}

interface UsePushableVideoSelectionReturn {
  selectedIds: Set<string>;
  selectedCount: number;
  hasSelection: boolean;
  isSelected: (videoId: string) => boolean;
  toggleSelection: (videoId: string) => void;
  selectMultiple: (videoIds: string[]) => void;
  deselectAll: () => void;
  clearSelection: () => void;
}

/**
 * Hook for managing video selection for pushing to analytics.
 * Unlike useVideoSelection, this hook works across all video views (ready, scheduled, published)
 * and doesn't depend on a specific list of videos.
 */
export function usePushableVideoSelection(): UsePushableVideoSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  const isSelected = useCallback(
    (videoId: string) => selectedIds.has(videoId),
    [selectedIds]
  );

  const toggleSelection = useCallback((videoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  }, []);

  const selectMultiple = useCallback((videoIds: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      videoIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    isSelected,
    toggleSelection,
    selectMultiple,
    deselectAll,
    clearSelection,
  };
}
