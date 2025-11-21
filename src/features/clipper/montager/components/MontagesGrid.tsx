"use client";

import { Film } from "lucide-react";
import { MontageVideoCard } from "./MontageVideoCard";
import type { MontagerVideoDb } from "../../shared/types/common.types";

interface MontagesGridProps {
  videos: MontagerVideoDb[];
}

export function MontagesGrid({ videos }: MontagesGridProps) {
  if (videos.length === 0) {
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {videos.map((video) => (
        <MontageVideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}
