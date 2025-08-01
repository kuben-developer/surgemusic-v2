"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Lock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CreditsDialog } from "@/features/credits";
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