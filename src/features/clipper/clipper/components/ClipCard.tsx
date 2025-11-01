"use client";

import { Sparkles, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ClipperClip } from "../../shared/types/common.types";
import { useEffect, useRef } from "react";

interface ClipCardProps {
  clip: ClipperClip;
  isSelected: boolean;
  onToggleSelection: () => void;
  autoplay: boolean;
}

export function ClipCard({
  clip,
  isSelected,
  onToggleSelection,
  autoplay,
}: ClipCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (autoplay) {
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to first frame
    }
  }, [autoplay]);
  const getQualityLabel = (value: number, type: 'clarity' | 'brightness') => {
    if (type === 'clarity') {
      if (value >= 400) return { label: 'Excellent', color: 'text-green-600' };
      if (value >= 300) return { label: 'Good', color: 'text-blue-600' };
      if (value >= 200) return { label: 'Fair', color: 'text-yellow-600' };
      return { label: 'Poor', color: 'text-red-600' };
    } else {
      if (value >= 180) return { label: 'Bright', color: 'text-green-600' };
      if (value >= 120) return { label: 'Good', color: 'text-blue-600' };
      if (value >= 80) return { label: 'Dim', color: 'text-yellow-600' };
      return { label: 'Dark', color: 'text-red-600' };
    }
  };

  const clarityQuality = getQualityLabel(clip.clarity, 'clarity');
  const brightnessQuality = getQualityLabel(clip.brightness, 'brightness');

  return (
    <Card
      className={cn(
        "group relative transition-all hover:shadow-lg hover:bg-muted/50 cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onToggleSelection}
    >
      <CardContent className="p-3">
        {/* Checkbox */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            className="size-6 sm:size-5 bg-white shadow-md"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Video Player - Vertical TikTok Style */}
        <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden mb-2">
          {clip.presignedUrl ? (
            <video
              ref={videoRef}
              src={clip.presignedUrl}
              className="w-full h-full object-contain"
              preload="metadata"
              loop
              autoPlay={autoplay}
              muted
              playsInline
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3" />
              <span className="text-muted-foreground">Clarity:</span>
            </div>
            <span className={cn("font-semibold", clarityQuality.color)}>
              {clarityQuality.label}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Sun className="size-3" />
              <span className="text-muted-foreground">Brightness:</span>
            </div>
            <span className={cn("font-semibold", brightnessQuality.color)}>
              {brightnessQuality.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
