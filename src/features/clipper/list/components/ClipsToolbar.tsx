"use client";

import { ArrowLeft, Trash2, RefreshCw, Pause, Play } from "lucide-react";
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
  onRefresh: () => void;
  autoplay: boolean;
  onToggleAutoplay: () => void;
  videoName: string;
}

export function ClipsToolbar({
  onBack,
  selectedCount,
  totalCount,
  onDelete,
  sortOptions,
  onSortChange,
  onRefresh,
  autoplay,
  onToggleAutoplay,
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant={autoplay ? "default" : "outline"}
            size="sm"
            onClick={onToggleAutoplay}
            className="gap-2"
          >
            {autoplay ? <Pause className="size-4" /> : <Play className="size-4" />}
            <span className="hidden sm:inline">{autoplay ? "Stop Autoplay" : "Start Autoplay"}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
    </div>
  );
}
