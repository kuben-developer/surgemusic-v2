"use client";

import { Film } from "lucide-react";
import { ClipCard } from "./ClipCard";
import type { ClipWithIndex } from "../types/clipper.types";

interface ClipsGridProps {
  clips: ClipWithIndex[];
  selectedIndices: number[];
  onToggleSelection: (index: number) => void;
  autoplay: boolean;
}

export function ClipsGrid({
  clips,
  selectedIndices,
  onToggleSelection,
  autoplay,
}: ClipsGridProps) {
  if (clips.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Film className="size-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">No Clips Yet</h3>
        <p>This video is still being processed.</p>
        <p className="text-sm mt-2">
          Processing typically takes a few minutes depending on video length.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clips Grid - 5 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {clips.map((clip) => (
          <ClipCard
            key={clip.index}
            clip={clip}
            isSelected={selectedIndices.includes(clip.index)}
            onToggleSelection={() => onToggleSelection(clip.index)}
            autoplay={autoplay}
          />
        ))}
      </div>
    </div>
  );
}
