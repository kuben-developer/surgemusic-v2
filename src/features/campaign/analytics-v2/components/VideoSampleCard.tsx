"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Video, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface VideoSampleCardProps {
  sample: {
    videoUrl: string;
    thumbnailUrl: string;
    addedAt: number;
  };
  index: number;
  onRemoveClick?: (index: number) => void;
  isRemoving?: boolean;
  isMobile?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (index: number) => void;
}

export function VideoSampleCard({
  sample,
  index,
  onRemoveClick,
  isRemoving,
  isMobile,
  isSelectMode,
  isSelected,
  onToggleSelect,
}: VideoSampleCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px", threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    if (isSelectMode) {
      onToggleSelect?.(index);
      return;
    }
    setIsPlaying(true);
    setTimeout(() => {
      void videoRef.current?.play();
    }, 0);
  };

  const handleRemoveButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveClick?.(index);
  };

  const hasThumbnail =
    sample.thumbnailUrl &&
    sample.thumbnailUrl !== "manual_upload" &&
    sample.thumbnailUrl !== "direct_upload" &&
    sample.thumbnailUrl !== "";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-lg overflow-hidden bg-muted border border-border",
        "hover:border-primary/20 transition-colors group",
        isMobile ? "w-[120px] aspect-[9/16]" : "aspect-[9/16]",
        isRemoving && "opacity-50 pointer-events-none",
        isSelectMode && "cursor-pointer",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={isSelectMode ? handleClick : undefined}
    >
      {/* Selection checkbox */}
      {isSelectMode && (
        <div className="absolute top-1.5 left-1.5 z-20">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(index)}
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>
      )}

      {/* Remove button (hidden in select mode) */}
      {onRemoveClick && !isSelectMode && (
        <div
          className={cn(
            "absolute top-1.5 right-1.5 z-20 transition-opacity",
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground",
              isMobile ? "size-7" : "size-6"
            )}
            onClick={handleRemoveButtonClick}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <X className="size-3" />
            )}
          </Button>
        </div>
      )}

      {/* Video content */}
      {isInView ? (
        isPlaying && !isSelectMode ? (
          <video
            ref={videoRef}
            src={sample.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            loop
            playsInline
          />
        ) : (
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={isSelectMode ? undefined : handleClick}
          >
            {hasThumbnail ? (
              <img
                src={sample.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Video className="size-8 text-muted-foreground/40" />
              </div>
            )}

            {/* Play button overlay (hidden in select mode) */}
            {!isSelectMode && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div
                  className={cn(
                    "rounded-full bg-background/90 flex items-center justify-center shadow-md",
                    "transition-transform group-hover:scale-105",
                    isMobile ? "size-10" : "size-12"
                  )}
                >
                  <Play
                    className={cn(
                      "text-foreground ml-0.5",
                      isMobile ? "size-4" : "size-5"
                    )}
                    fill="currentColor"
                  />
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Video className="size-6 text-muted-foreground/30 animate-pulse" />
        </div>
      )}
    </div>
  );
}
