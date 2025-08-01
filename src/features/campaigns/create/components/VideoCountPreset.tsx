"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CreditsDialog } from "@/features/credits";
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
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col items-center gap-3 p-4">
            {!isSubscribed ? (
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Subscribe to Generate Videos
              </Link>
            ) : (
              <CreditsDialog
                onSelectCredits={() => { }}
                hasSubscription={isSubscribed}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}