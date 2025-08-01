"use client";

import { Progress } from "@/components/ui/progress";

interface UnscheduleProgressProps {
  progress: number;
  selectedCount: number;
  isUnscheduling: boolean;
}

export function UnscheduleProgress({
  progress,
  selectedCount,
  isUnscheduling
}: UnscheduleProgressProps) {
  if (!isUnscheduling) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground text-center">
        Unscheduling {selectedCount} posts...
      </p>
    </div>
  );
}