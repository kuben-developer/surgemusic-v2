"use client";

import { useState, useCallback, useMemo } from "react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type MontagerVideo = Doc<"montagerVideos">;

interface UseVideoSelectionReturn {
  selectedIds: Set<string>;
  selectedCount: number;
  hasSelection: boolean;
  allSelected: boolean;
  isSelected: (videoId: string) => boolean;
  toggleSelection: (videoId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  clearSelection: () => void;
}

export function useVideoSelection(
  videos: MontagerVideo[]
): UseVideoSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const videoIds = useMemo(
    () => new Set(videos.map((v) => v._id)),
    [videos]
  );

  // Clean up selected IDs that are no longer in the videos list
  const validSelectedIds = useMemo(() => {
    const valid = new Set<string>();
    selectedIds.forEach((id) => {
      if (videoIds.has(id as Doc<"montagerVideos">["_id"])) {
        valid.add(id);
      }
    });
    return valid;
  }, [selectedIds, videoIds]);

  const selectedCount = validSelectedIds.size;
  const hasSelection = selectedCount > 0;
  const allSelected = videos.length > 0 && selectedCount === videos.length;

  const isSelected = useCallback(
    (videoId: string) => validSelectedIds.has(videoId),
    [validSelectedIds]
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

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(videos.map((v) => v._id)));
  }, [videos]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds: validSelectedIds,
    selectedCount,
    hasSelection,
    allSelected,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    clearSelection,
  };
}
