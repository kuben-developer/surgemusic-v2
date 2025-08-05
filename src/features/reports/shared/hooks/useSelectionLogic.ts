"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface UseSelectionLogicProps {
  items: Doc<"campaigns">[];
  onItemSelect?: (itemId: string, selected: boolean) => void;
}

export function useSelectionLogic({ items, onItemSelect }: UseSelectionLogicProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  
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

  // Handle click selection with shift-click support
  const handleItemClick = useCallback((index: number, item: Doc<"campaigns">, e: React.MouseEvent) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    if (e.shiftKey && lastSelectedIndex !== null && lastSelectedIndex !== index) {
      // Shift-click: select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      
      // We need the current items array, which will be passed through the context
      // Since items can change due to filtering, we'll use the items prop directly
      // Get fresh items from the current render
      const currentItems = items;
      
      // Select all items in the range
      for (let i = start; i <= end; i++) {
        const rangeItem = currentItems[i];
        if (rangeItem) {
          // Always select items in range, don't check if already selected
          handleItemSelect(rangeItem._id, true);
        }
      }
      // Update lastSelectedIndex to the new position
      setLastSelectedIndex(index);
    } else if (!e.shiftKey) {
      // Normal click: toggle selection
      handleItemSelect(item._id, !selectedIds.has(item._id));
      setLastSelectedIndex(index);
    }
  }, [handleItemSelect, selectedIds, lastSelectedIndex, items]);

  // Reset lastSelectedIndex when items change (e.g., after filtering)
  useEffect(() => {
    setLastSelectedIndex(null);
  }, [items]);

  // Dummy handler for compatibility (no longer needed but kept for interface)
  const handleMouseDown = useCallback(() => {
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