"use client";

import { useState, useRef, useCallback } from "react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface UseSelectionLogicProps {
  items: Doc<"campaigns">[];
  onItemSelect?: (itemId: string, selected: boolean) => void;
}

export function useSelectionLogic({ items, onItemSelect }: UseSelectionLogicProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Selection handlers
  const handleItemSelect = useCallback((itemId: string, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
    
    // Call the external callback if provided
    if (onItemSelect) {
      onItemSelect(itemId, selected);
    }
  }, [onItemSelect]);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(items.map(item => item._id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [items]);

  // Simple click selection - just toggle the item
  const handleItemClick = useCallback((index: number, item: Doc<"campaigns">, e: React.MouseEvent) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    // Simple toggle selection
    handleItemSelect(item._id, !selectedIds.has(item._id));
  }, [handleItemSelect, selectedIds]);

  // Dummy handler for compatibility (no longer needed but kept for interface)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Do nothing - drag selection removed
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    handleItemSelect,
    handleSelectAll,
    handleMouseDown,
    handleItemClick,
    containerRef,
    itemRefs,
    isSelecting: false, // Always false now - no drag selection
    selectionRectStyle: null, // No selection rectangle needed
  };
}