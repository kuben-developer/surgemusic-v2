"use client";

import { PlatformStatusBadge } from "./PlatformStatusBadge";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface PlatformActionsProps {
  video: Doc<"generatedVideos">;
  hasAnyPlatformUploads: boolean;
}

export function PlatformActions({ video, hasAnyPlatformUploads }: PlatformActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      {(['tiktok', 'instagram', 'youtube'] as const).map(platform => (
        <PlatformStatusBadge
          key={platform}
          platform={platform}
          video={video}
        />
      )).filter(Boolean)}
      
      {/* Show message if no platforms scheduled */}
      {!hasAnyPlatformUploads && (
        <span className="text-xs text-muted-foreground">Not scheduled</span>
      )}
    </div>
  );
}