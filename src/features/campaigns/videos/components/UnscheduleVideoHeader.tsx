"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { Doc } from "convex/_generated/dataModel";

interface UnscheduleVideoHeaderProps {
  selectedVideos: string[];
  scheduledVideos?: Doc<"generatedVideos">[];
  isUnscheduling: boolean;
  onToggleSelectAll: () => void;
}

export function UnscheduleVideoHeader({
  selectedVideos,
  scheduledVideos,
  isUnscheduling,
  onToggleSelectAll
}: UnscheduleVideoHeaderProps) {
  const totalVideos = scheduledVideos?.length || 0;
  const selectedCount = selectedVideos.length;
  const isAllSelected = selectedCount === totalVideos && totalVideos > 0;

  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={onToggleSelectAll}
          disabled={isUnscheduling}
        />
        <label className="text-sm font-medium">
          Select all ({totalVideos} posts)
        </label>
      </div>
      {selectedCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {selectedCount} selected
        </span>
      )}
    </div>
  );
}