"use client";

import { Sparkles, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ClipperClip } from "../../shared/types/common.types";
import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Lazy load videos using Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Once shouldLoad is true, never set it back to false
            // This prevents video reloading when sorting changes DOM positions
            setShouldLoad(true);
          } else {
            setIsInView(false);
            // Don't set shouldLoad to false - keep video loaded
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before video enters viewport
        threshold: 0,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Load first frame when video metadata is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    const handleLoadedData = () => {
      // Video has loaded enough to show first frame
      if (!autoplay) {
        video.currentTime = 0;
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [shouldLoad, autoplay]);

  // Handle autoplay based on visibility and autoplay setting
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (autoplay && isInView) {
      video.play().catch(() => {
        // Ignore autoplay errors
      });
    } else {
      video.pause();
    }
  }, [autoplay, isInView, shouldLoad]);
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
        <div
          ref={containerRef}
          className="aspect-[9/16] bg-black rounded-lg overflow-hidden mb-2"
        >
          {clip.presignedUrl ? (
            shouldLoad ? (
              <video
                ref={videoRef}
                src={clip.presignedUrl}
                className="w-full h-full object-contain"
                preload="auto"
                loop
                muted
                playsInline
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            )
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
