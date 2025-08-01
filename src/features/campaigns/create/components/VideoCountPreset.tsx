"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LockOverlay } from "./LockOverlay";
import type { VideoOption } from "../constants/video-options";

interface VideoCountPresetProps {
  option: VideoOption;
  isSelected: boolean;
  isLocked: boolean;
  lockReason: string;
  isSubscribed: boolean;
  onSelect: () => void;
}

export function VideoCountPreset({
  option,
  isSelected,
  isLocked,
  lockReason,
  isSubscribed,
  onSelect
}: VideoCountPresetProps) {
  return (
    <div className="relative group">
      <Button
        variant="outline"
        onClick={() => !isLocked && onSelect()}
        disabled={isLocked}
        className={cn(
          "w-full px-6 py-6 text-base font-medium justify-between transition-all duration-200",
          "hover:border-primary/50 hover:shadow-md",
          isSelected && "ring-2 ring-primary bg-primary/5",
          isLocked && "opacity-75"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{option.count} Videos</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {lockReason}
          </span>
          {isLocked && (
            <div className="p-2 rounded-full bg-muted">
              <Lock className="w-4 h-4" />
            </div>
          )}
        </div>
      </Button>
      <LockOverlay isLocked={isLocked} isSubscribed={isSubscribed} />
    </div>
  );
}