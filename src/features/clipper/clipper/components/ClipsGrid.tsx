"use client";

import { Film } from "lucide-react";
import { ClipCard } from "./ClipCard";
import type { ClipperClip } from "../../shared/types/common.types";
import { Progress } from "@/components/ui/progress";

interface ClipsGridProps {
  clips: ClipperClip[];
  selectedKeys: string[];
  onToggleSelection: (key: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  loadedCount: number;
  totalCount: number;
  progress: number;
  autoplay: boolean;
}

export function ClipsGrid({
  clips,
  selectedKeys,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  loadedCount,
  totalCount,
  progress,
  autoplay,
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

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {loadedCount < totalCount && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Loading thumbnails...</span>
            <span className="text-muted-foreground">
              {loadedCount} / {totalCount}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Clips Grid - 5 columns */}
      <div className="grid grid-cols-5 gap-4">
        {clips.map((clip) => (
          <ClipCard
            key={clip.key}
            clip={clip}
            isSelected={selectedKeys.includes(clip.key)}
            onToggleSelection={() => onToggleSelection(clip.key)}
            autoplay={autoplay}
          />
        ))}
      </div>
    </div>
  );
}
