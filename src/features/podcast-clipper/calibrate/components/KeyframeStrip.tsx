"use client";

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock, Crosshair, ChevronLeft, ChevronRight } from "lucide-react";
import type { CropKeyframe } from "../types/calibration.types";

interface KeyframeStripProps {
  keyframes: CropKeyframe[];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function KeyframeStrip({ keyframes, selectedIndex, onSelect }: KeyframeStripProps) {
  // Navigation: null = default, 0..N-1 = keyframe indices
  // Stepping: default → 0 → 1 → ... → N-1 → default (wraps)
  const goNext = useCallback(() => {
    if (selectedIndex === null) {
      onSelect(0);
    } else if (selectedIndex < keyframes.length - 1) {
      onSelect(selectedIndex + 1);
    } else {
      onSelect(null);
    }
  }, [selectedIndex, keyframes.length, onSelect]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) {
      onSelect(keyframes.length - 1);
    } else if (selectedIndex > 0) {
      onSelect(selectedIndex - 1);
    } else {
      onSelect(null);
    }
  }, [selectedIndex, keyframes.length, onSelect]);

  // Keyboard shortcuts: left/right arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  if (keyframes.length === 0) return null;

  // Current position label
  const positionLabel = selectedIndex === null
    ? "Default"
    : `${selectedIndex + 1} / ${keyframes.length}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            Timeline Keyframes
          </p>
          <span className="text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded-full">
            {keyframes.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] tabular-nums text-muted-foreground font-medium min-w-[48px] text-center">
            {positionLabel}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {/* Default frame button */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "flex-shrink-0 flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all border",
            selectedIndex === null
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-transparent hover:border-border hover:bg-muted/50"
          )}
        >
          <div className={cn(
            "w-[68px] h-[38px] rounded-md flex items-center justify-center transition-colors",
            selectedIndex === null ? "bg-primary/10" : "bg-muted"
          )}>
            <Crosshair className={cn(
              "h-3.5 w-3.5",
              selectedIndex === null ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <span className={cn(
            "text-[10px] font-medium",
            selectedIndex === null ? "text-primary" : "text-muted-foreground"
          )}>
            Default
          </span>
        </button>

        {keyframes.map((kf, index) => {
          const isSelected = selectedIndex === index;
          const hasCustomCrop = kf.crop !== null;

          return (
            <button
              key={kf.keyframeId}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all border",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-transparent hover:border-border hover:bg-muted/50"
              )}
            >
              <div className="relative w-[68px] h-[38px] rounded-md overflow-hidden bg-muted">
                {kf.frameUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={kf.frameUrl}
                    alt={`${formatTimestamp(kf.timestamp)}`}
                    className={cn(
                      "w-full h-full object-cover transition-opacity",
                      isSelected ? "opacity-100" : "opacity-80 hover:opacity-100"
                    )}
                  />
                )}
                {/* Status dot */}
                <div className={cn(
                  "absolute top-1 right-1 w-1.5 h-1.5 rounded-full ring-1 ring-black/20",
                  hasCustomCrop ? "bg-emerald-400" : "bg-white/50"
                )} />
              </div>
              <span className={cn(
                "text-[10px] tabular-nums font-medium",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {formatTimestamp(kf.timestamp)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
