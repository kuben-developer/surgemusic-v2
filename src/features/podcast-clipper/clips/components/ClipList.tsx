"use client";

import { ClipCard } from "./ClipCard";
import { Scissors } from "lucide-react";
import type { PodcastClipperClip } from "../../shared/types/podcast-clipper.types";

interface ClipListProps {
  clips: PodcastClipperClip[];
}

export function ClipList({ clips }: ClipListProps) {
  if (clips.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <Scissors className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-sm font-medium mb-1">No clips yet</h3>
        <p className="text-sm text-muted-foreground">
          Generate clips from the transcript to get started.
        </p>
      </div>
    );
  }

  const sorted = [...clips].sort((a, b) => a.clipIndex - b.clipIndex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((clip) => (
        <ClipCard key={clip._id} clip={clip} />
      ))}
    </div>
  );
}
