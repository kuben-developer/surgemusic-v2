"use client";

import { useState, useCallback } from "react";

export function useClipSelection() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((keys: string[]) => {
    setSelectedKeys(new Set(keys));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const isSelected = useCallback(
    (key: string) => {
      return selectedKeys.has(key);
    },
    [selectedKeys]
  );

  return {
    selectedKeys: Array.from(selectedKeys),
    selectedCount: selectedKeys.size,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}
