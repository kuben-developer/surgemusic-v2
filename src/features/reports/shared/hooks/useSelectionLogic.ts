"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface UseSelectionLogicProps {
  items: Doc<"campaigns">[];
  onItemSelect?: (itemId: string, selected: boolean) => void;
}

export function useSelectionLogic({ items, onItemSelect }: UseSelectionLogicProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [dragSelectedIds, setDragSelectedIds] = useState<Set<string>>(new Set());
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(new Set());
  
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

  // Handle drag selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    // Only activate drag selection when holding ctrl/cmd
    if (!e.ctrlKey && !e.metaKey) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Check if we're clicking on a checkbox or button
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input[type="checkbox"]')) {
      return;
    }
    
    setIsSelecting(true);
    setSelectionStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    // Store the initial selection state when drag starts
    setInitialSelectedIds(new Set(selectedIds));
    setDragSelectedIds(new Set());
  }, [selectedIds]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isSelecting || !selectionStart || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    // Calculate selection rectangle
    const minX = Math.min(selectionStart.x, e.clientX - rect.left);
    const maxX = Math.max(selectionStart.x, e.clientX - rect.left);
    const minY = Math.min(selectionStart.y, e.clientY - rect.top);
    const maxY = Math.max(selectionStart.y, e.clientY - rect.top);
    
    // Check which items are within the selection
    const itemsInDragRect = new Set<string>();
    
    itemRefs.current.forEach((element, itemId) => {
      const elemRect = element.getBoundingClientRect();
      const elemX = elemRect.left - rect.left;
      const elemY = elemRect.top - rect.top;
      
      const inSelection = 
        elemX < maxX && 
        elemX + elemRect.width > minX &&
        elemY < maxY && 
        elemY + elemRect.height > minY;
      
      if (inSelection) {
        itemsInDragRect.add(itemId);
      }
    });
    
    // Track items that are being drag-selected
    setDragSelectedIds(itemsInDragRect);
    
    // Combine initial selection with drag selection
    const combinedSelection = new Set([...initialSelectedIds, ...itemsInDragRect]);
    
    // Update the selection - only call callbacks for actual changes
    combinedSelection.forEach(id => {
      if (!selectedIds.has(id)) {
        if (onItemSelect) {
          onItemSelect(id, true);
        }
      }
    });
    
    // Update internal state
    setSelectedIds(combinedSelection);
  }, [isSelecting, selectionStart, initialSelectedIds, selectedIds, onItemSelect]);

  const handleMouseUp = useCallback(() => {
    // Finalize the selection
    if (isSelecting && dragSelectedIds.size > 0) {
      // Ensure all drag-selected items are properly added
      const finalSelection = new Set([...initialSelectedIds, ...dragSelectedIds]);
      setSelectedIds(finalSelection);
    }
    
    // Reset drag selection state
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    setDragSelectedIds(new Set());
    setInitialSelectedIds(new Set());
  }, [isSelecting, dragSelectedIds, initialSelectedIds]);

  // Handle click selection
  const handleItemClick = useCallback((index: number, item: Doc<"campaigns">, e: React.MouseEvent) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      // Select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      
      for (let i = start; i <= end; i++) {
        const item = items[i];
        if (item) {
          handleItemSelect(item._id, true);
        }
      }
      setLastSelectedIndex(index);
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd click - do nothing (only used for drag selection)
      return;
    } else {
      // Normal click - toggle selection without clearing others
      handleItemSelect(item._id, !selectedIds.has(item._id));
      setLastSelectedIndex(index);
    }
  }, [lastSelectedIndex, items, handleItemSelect, selectedIds]);

  // Set up mouse event listeners
  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  // Selection rectangle styles
  const selectionRectStyle = useMemo(() => {
    if (!isSelecting || !selectionStart || !selectionEnd) return null;
    
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }, [isSelecting, selectionStart, selectionEnd]);

  return {
    selectedIds,
    setSelectedIds,
    handleItemSelect,
    handleSelectAll,
    handleMouseDown,
    handleItemClick,
    containerRef,
    itemRefs,
    isSelecting,
    selectionRectStyle,
  };
}