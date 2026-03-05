"use client";

import { cn } from "@/lib/utils";
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
  if (keyframes.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">
        Timeline Keyframes ({keyframes.length})
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {/* Default frame button */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "flex-shrink-0 flex flex-col items-center gap-0.5 rounded-md p-1 transition-colors",
            selectedIndex === null
              ? "ring-2 ring-primary bg-primary/10"
              : "hover:bg-muted"
          )}
        >
          <div className="w-[72px] h-[40px] rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
            Default
          </div>
          <span className="text-[10px] text-muted-foreground">base</span>
        </button>

        {keyframes.map((kf, index) => (
          <button
            key={kf.keyframeId}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center gap-0.5 rounded-md p-1 transition-colors",
              selectedIndex === index
                ? "ring-2 ring-primary bg-primary/10"
                : "hover:bg-muted"
            )}
          >
            <div className="relative w-[72px] h-[40px] rounded overflow-hidden bg-muted">
              {kf.frameUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={kf.frameUrl}
                  alt={`Keyframe at ${formatTimestamp(kf.timestamp)}`}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Dot indicator */}
              <div
                className={cn(
                  "absolute top-0.5 right-0.5 w-2 h-2 rounded-full",
                  kf.crop !== null ? "bg-green-500" : "bg-gray-400"
                )}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {formatTimestamp(kf.timestamp)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
