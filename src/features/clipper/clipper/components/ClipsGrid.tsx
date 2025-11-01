"use client";

import { Film } from "lucide-react";
import { ClipCard } from "./ClipCard";
import type { ClipperClip } from "../../shared/types/common.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ClipsGridProps {
  clips: ClipperClip[];
  selectedKeys: string[];
  onToggleSelection: (key: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export function ClipsGrid({
  clips,
  selectedKeys,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
}: ClipsGridProps) {
  if (clips.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Film className="size-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">No Clips Yet</h3>
        <p>Upload videos to this folder and wait for them to be processed.</p>
        <p className="text-sm mt-2">
          Processing typically takes a few minutes depending on video length.
        </p>
      </div>
    );
  }

  const allSelected = selectedKeys.length === clips.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;

  return (
    <div className="space-y-4">
      {/* Selection Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={allSelected}
            onCheckedChange={allSelected ? onClearSelection : onSelectAll}
            className={someSelected && !allSelected ? "data-[state=checked]:bg-primary/50" : ""}
          />
          <p className="text-sm font-medium">
            {selectedKeys.length > 0
              ? `${selectedKeys.length} of ${clips.length} selected`
              : `${clips.length} ${clips.length === 1 ? "clip" : "clips"} total`}
          </p>
        </div>
        {someSelected && (
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        )}
      </div>

      {/* Clips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {clips.map((clip) => (
          <ClipCard
            key={clip.key}
            clip={clip}
            isSelected={selectedKeys.includes(clip.key)}
            onToggleSelection={() => onToggleSelection(clip.key)}
          />
        ))}
      </div>
    </div>
  );
}
