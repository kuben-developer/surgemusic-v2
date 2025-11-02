"use client";

import { Film } from "lucide-react";
import { MontageCard } from "./MontageCard";
import type { Montage } from "../../shared/types/common.types";

interface MontagesGridProps {
  montages: Montage[];
  loadedCount: number;
  totalCount: number;
  progress: number;
}

export function MontagesGrid({
  montages,
  loadedCount,
  totalCount,
  progress,
}: MontagesGridProps) {
  if (totalCount === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Film className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No montages yet</h3>
        <p className="text-sm text-muted-foreground">
          Create a montage configuration to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Loading progress */}
      {loadedCount < totalCount && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Loading thumbnails... {loadedCount} / {totalCount}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {montages.map((montage) => (
          <MontageCard key={montage.key} montage={montage} />
        ))}
      </div>
    </div>
  );
}
