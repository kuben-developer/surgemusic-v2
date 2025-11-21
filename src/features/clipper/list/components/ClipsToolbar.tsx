"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortToggleButtons } from "./SortToggleButtons";
import type { SortOptions, SortField } from "../types/clipper.types";

interface ClipsToolbarProps {
  onBack: () => void;
  selectedCount: number;
  totalCount: number;
  onDelete: () => void;
  sortOptions: SortOptions;
  onSortChange: (field: SortField) => void;
  videoName: string;
}

export function ClipsToolbar({
  onBack,
  selectedCount,
  totalCount,
  onDelete,
  sortOptions,
  onSortChange,
  videoName,
}: ClipsToolbarProps) {
  return (
    <div className="space-y-4 pb-6 border-b">
      {/* Header section */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{videoName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedCount > 0
              ? `${selectedCount} of ${totalCount} selected`
              : `${totalCount} ${totalCount === 1 ? "clip" : "clips"} total`}
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <SortToggleButtons
          activeField={sortOptions.field}
          activeOrder={sortOptions.order}
          onSortChange={onSortChange}
        />

        {selectedCount > 0 && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Delete ({selectedCount})</span>
            <span className="sm:hidden">Delete</span>
          </Button>
        )}
      </div>
    </div>
  );
}
