"use client";

import { Sparkles, Sun, Play, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ClipperClip } from "../../shared/types/common.types";
import { useEffect, useRef, useState } from "react";
import { useLazyVideoUrl } from "../hooks/useLazyVideoUrl";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { fetchVideoUrl, isLoading, getCachedUrl } = useLazyVideoUrl();

  // Check if we have a cached video URL on mount
  useEffect(() => {
    const cached = getCachedUrl(clip.key);
    if (cached) {
      setVideoUrl(cached);
    }
  }, [clip.key, getCachedUrl]);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    if (autoplay && isPlaying) {
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    } else if (!autoplay) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to first frame
    }
  }, [autoplay, isPlaying, videoUrl]);

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If already playing, toggle pause
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If video URL not loaded yet, fetch it
    if (!videoUrl) {
      const url = await fetchVideoUrl(clip.key);
      if (url) {
        setVideoUrl(url);
        setIsPlaying(true);
      }
    } else {
      // Resume playing
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Ignore play errors
        });
      }
    }
  };
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

        {/* Thumbnail/Video Player - Vertical TikTok Style */}
        <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden mb-2">
          {/* Clip timestamp badge */}
          <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
            {clip.clipNumber}s
          </div>

          {isPlaying && videoUrl ? (
            // Show video when playing
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              preload="metadata"
              loop
              autoPlay={autoplay}
              muted
              playsInline
            />
          ) : clip.thumbnailUrl ? (
            // Show thumbnail image by default
            <>
              <img
                src={clip.thumbnailUrl}
                alt={clip.filename}
                className="w-full h-full object-contain"
              />
              {/* Play button overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handlePlayClick}
              >
                {isLoading(clip.key) ? (
                  <Loader2 className="size-12 text-white animate-spin" />
                ) : (
                  <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors">
                    <Play className="size-8 text-black fill-black" />
                  </div>
                )}
              </div>
            </>
          ) : (
            // Loading state
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
