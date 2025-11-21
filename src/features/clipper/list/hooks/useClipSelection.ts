"use client";

import { useState, useCallback } from "react";

/**
 * Hook for managing clip selection using indices
 */
export function useClipSelection() {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleSelection = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((indices: number[]) => {
    setSelectedIndices(new Set(indices));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIndices(new Set());
  }, []);

  const isSelected = useCallback(
    (index: number) => {
      return selectedIndices.has(index);
    },
    [selectedIndices]
  );

  return {
    selectedIndices: Array.from(selectedIndices),
    selectedCount: selectedIndices.size,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}
