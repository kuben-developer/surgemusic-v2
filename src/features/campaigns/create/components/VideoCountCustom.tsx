"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Lock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { LockOverlay } from "./LockOverlay";
import { CUSTOM_VIDEO_CONFIG } from "../constants/video-options";

interface VideoCountCustomProps {
  isCustomMode: boolean;
  customVideoCount: number;
  isSubscribed: boolean;
  totalCredits: number;
  onCustomModeToggle: () => void;
  onSliderChange: (value: number[]) => void;
}

export function VideoCountCustom({
  isCustomMode,
  customVideoCount,
  isSubscribed,
  totalCredits,
  onCustomModeToggle,
  onSliderChange
}: VideoCountCustomProps) {
  const isLocked = !isSubscribed || totalCredits < customVideoCount;
  const lockReason = !isSubscribed ? "Subscription required" : `Requires ${customVideoCount} credits`;
  const maxSliderValue = Math.min(totalCredits, CUSTOM_VIDEO_CONFIG.MAX_COUNT);

  return (
    <>
      {/* Custom Video Count Option */}
      <div className="relative group">
        <Button
          variant="outline"
          onClick={() => !isLocked && onCustomModeToggle()}
          disabled={isLocked}
          className={cn(
            "w-full px-6 py-6 text-base font-medium justify-between transition-all duration-200",
            "hover:border-primary/50 hover:shadow-md",
            isCustomMode && "ring-2 ring-primary bg-primary/5",
            isLocked && "opacity-75"
          )}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5" />
            <span className="text-lg">Custom Amount</span>
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

      {/* Custom Slider - Show when custom mode is selected */}
      {isCustomMode && (
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Custom Video Count</label>
            <span className="text-lg font-semibold text-primary">{customVideoCount} Videos</span>
          </div>
          <div className="space-y-2">
            <Slider
              value={[customVideoCount]}
              onValueChange={onSliderChange}
              max={maxSliderValue}
              min={CUSTOM_VIDEO_CONFIG.MIN_COUNT}
              step={CUSTOM_VIDEO_CONFIG.STEP}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{CUSTOM_VIDEO_CONFIG.MIN_COUNT}</span>
              <span>{maxSliderValue} (Max)</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Adjust the slider to select your desired number of videos. Each video requires 1 credit.
          </p>
        </div>
      )}
    </>
  );
}