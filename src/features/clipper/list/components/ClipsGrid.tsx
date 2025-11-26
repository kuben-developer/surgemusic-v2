"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { Film } from "lucide-react";
import { ClipCard } from "./ClipCard";
import { Progress } from "@/components/ui/progress";
import type { ClipWithIndex } from "../types/clipper.types";

interface ClipsGridProps {
  allClips: ClipWithIndex[];
  visibleRange: { startIndex: number; endIndex: number };
  selectedSet: Set<number>;
  onToggleSelection: (index: number) => void;
}

export const ClipsGrid = memo(function ClipsGrid({
  allClips,
  visibleRange,
  selectedSet,
  onToggleSelection,
}: ClipsGridProps) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  const totalClips = allClips.length;
  const progress = totalClips > 0 ? Math.round((loadedCount / totalClips) * 100) : 0;

  const handleThumbnailLoad = useCallback(() => {
    setLoadedCount((prev) => prev + 1);
  }, []);

  // Mark as fully loaded when all thumbnails are loaded
  useEffect(() => {
    if (loadedCount >= totalClips && totalClips > 0) {
      setIsFullyLoaded(true);
    }
  }, [loadedCount, totalClips]);

  // Reset loading state when clips change
  useEffect(() => {
    setLoadedCount(0);
    setIsFullyLoaded(false);
  }, [totalClips]);

  if (allClips.length === 0) {
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
    <div className="space-y-4">
      {/* Loading Progress Bar */}
      {!isFullyLoaded && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Loading thumbnails...</span>
            <span>{loadedCount} / {totalClips}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Clips Grid - 5 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allClips.map((clip, idx) => {
          const isVisible = idx >= visibleRange.startIndex && idx < visibleRange.endIndex;
          return (
            <div
              key={clip.index}
              className={isVisible ? "" : "hidden"}
            >
              <ClipCard
                clip={clip}
                isSelected={selectedSet.has(clip.index)}
                onToggleSelection={onToggleSelection}
                onThumbnailLoad={handleThumbnailLoad}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
