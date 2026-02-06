"use client";

import { useState, useCallback } from "react";

interface UseContentSampleSelectionReturn {
  selectedIndices: Set<number>;
  selectedCount: number;
  hasSelection: boolean;
  isSelectMode: boolean;
  isSelected: (index: number) => boolean;
  toggleSelection: (index: number) => void;
  selectAll: (totalCount: number) => void;
  deselectAll: () => void;
  enterSelectMode: () => void;
  exitSelectMode: () => void;
}

export function useContentSampleSelection(): UseContentSampleSelectionReturn {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const selectedCount = selectedIndices.size;
  const hasSelection = selectedCount > 0;

  const isSelected = useCallback(
    (index: number) => selectedIndices.has(index),
    [selectedIndices]
  );

  const toggleSelection = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((totalCount: number) => {
    setSelectedIndices(new Set(Array.from({ length: totalCount }, (_, i) => i)));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIndices(new Set());
  }, []);

  const enterSelectMode = useCallback(() => {
    setIsSelectMode(true);
  }, []);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIndices(new Set());
  }, []);

  return {
    selectedIndices,
    selectedCount,
    hasSelection,
    isSelectMode,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    enterSelectMode,
    exitSelectMode,
  };
}
