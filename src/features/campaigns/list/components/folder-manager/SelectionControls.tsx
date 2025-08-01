"use client";

import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";

interface SelectionControlsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  actionButton?: React.ReactNode;
  children?: React.ReactNode;
}

export function SelectionControls({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actionButton,
  children,
}: SelectionControlsProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectAll(!allSelected)}
          className="gap-2"
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          Select All
        </Button>
        
        {children}
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            Clear selection
          </Button>
          {actionButton}
        </div>
      )}
    </div>
  );
}