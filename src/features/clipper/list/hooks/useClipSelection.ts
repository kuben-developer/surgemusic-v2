"use client";

import { useState, useCallback, useMemo } from "react";

/**
 * Hook for managing clip selection using indices
 */
export function useClipSelection() {
  const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set());

  const toggleSelection = useCallback((index: number) => {
    setSelectedSet((prev) => {
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
    setSelectedSet(new Set(indices));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSet(new Set());
  }, []);

  const isSelected = useCallback(
    (index: number) => {
      return selectedSet.has(index);
    },
    [selectedSet]
  );

  // Memoize array conversion to prevent unnecessary re-renders
  const selectedIndices = useMemo(
    () => Array.from(selectedSet),
    [selectedSet]
  );

  return {
    selectedIndices,
    selectedSet, // Expose Set for O(1) lookups
    selectedCount: selectedSet.size,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}
