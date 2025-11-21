"use client";

import { Sparkles, Sun, Play, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ClipWithIndex } from "../types/clipper.types";
import { useRef, useState } from "react";

interface ClipCardProps {
  clip: ClipWithIndex;
  isSelected: boolean;
  onToggleSelection: () => void;
}

export function ClipCard({
  clip,
  isSelected,
  onToggleSelection,
}: ClipCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Ignore play errors
      });
      setIsPlaying(true);
    }
  };

  const getQualityLabel = (value: number, type: 'clarity' | 'brightness') => {
    if (type === 'clarity') {
      if (value >= 100) return { label: `Excellent ${value}`, color: 'text-green-600' };
      if (value >= 4) return { label: `Good ${value}`, color: 'text-blue-600' };
      if (value >= 1) return { label: `Fair ${value}`, color: 'text-yellow-600' };
      return { label: `Poor ${value}`, color: 'text-red-600' };
    } else {
      if (value >= 60) return { label: `Bright ${value}`, color: 'text-green-600' };
      if (value >= 40) return { label: `Good ${value}`, color: 'text-blue-600' };
      if (value >= 30) return { label: `Dim ${value}`, color: 'text-yellow-600' };
      return { label: `Dark ${value}`, color: 'text-red-600' };
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

        {/* Thumbnail/Video Player - Vertical TikTok Style */}
        <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden mb-2">
          {/* Clip number badge */}
          <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
            #{clip.clipNumber}
          </div>

          {/* Video element (always present, controls visibility) */}
          <video
            ref={videoRef}
            src={clip.videoUrl}
            poster={clip.thumbnailUrl}
            className="w-full h-full object-contain"
            preload="metadata"
            loop
            muted
            playsInline
            onEnded={() => setIsPlaying(false)}
          />

          {/* Play/Pause button overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity",
              isPlaying ? "opacity-0 hover:opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={handlePlayClick}
          >
            <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors">
              {isPlaying ? (
                <Pause className="size-8 text-black fill-black" />
              ) : (
                <Play className="size-8 text-black fill-black" />
              )}
            </div>
          </div>
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
