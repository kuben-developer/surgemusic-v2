"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Crop } from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface ReframeSectionProps {
  calibrationStatus: string;
  selectedVideoIds: Set<string>;
  onStartReframe: (videoIds: Id<"podcastClipperVideos">[]) => Promise<void>;
}

export function ReframeSection({
  calibrationStatus,
  selectedVideoIds,
  onStartReframe,
}: ReframeSectionProps) {
  const [isReframing, setIsReframing] = useState(false);

  const canReframe = calibrationStatus === "configured" && selectedVideoIds.size > 0;

  const handleReframe = async () => {
    if (!canReframe) return;
    setIsReframing(true);
    try {
      const videoIds = Array.from(selectedVideoIds) as Id<"podcastClipperVideos">[];
      await onStartReframe(videoIds);
    } finally {
      setIsReframing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleReframe} disabled={!canReframe || isReframing}>
        {isReframing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Crop className="h-4 w-4 mr-2" />
            Reframe Selected ({selectedVideoIds.size})
          </>
        )}
      </Button>
      {calibrationStatus !== "configured" && selectedVideoIds.size > 0 && (
        <p className="text-sm text-muted-foreground">
          Complete calibration first to enable reframing.
        </p>
      )}
    </div>
  );
}
