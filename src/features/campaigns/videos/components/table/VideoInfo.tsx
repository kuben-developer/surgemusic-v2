"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LazyVideo } from "./LazyVideo";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface VideoInfoProps {
  video: Doc<"generatedVideos">;
  displayName: string;
}

export function VideoInfo({ video, displayName }: VideoInfoProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayPos, setOverlayPos] = useState<{ top: number; left: number; width: number; height: number }>({ top: 0, left: 0, width: 0, height: 0 });

  const openOverlay = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const margin = 12;
    const width = 200; // Big preview width
    const height = Math.round((width * 16) / 9); // Maintain 9:16 aspect ratio

    let left = rect.right + margin;
    if (left + width > window.innerWidth - 8) {
      left = rect.left - width - margin;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

    let top = rect.top + rect.height / 2 - height / 2;
    top = Math.max(8, Math.min(top, window.innerHeight - height - 8));

    setOverlayPos({ top, left, width, height });
    setIsOverlayOpen(true);
  };

  const closeOverlaySoon = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setIsOverlayOpen(false), 120);
  };

  const cancelClose = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  return (
    <>
      {/* Video preview and name */}
      <div className="flex items-center gap-3">
        <div
          ref={anchorRef}
          className="relative h-12 w-7 overflow-visible rounded-md bg-muted/20 flex-shrink-0"
          onMouseEnter={openOverlay}
          onMouseLeave={closeOverlaySoon}
        >
          <LazyVideo
            videoUrl={video.video.url}
            className="h-full w-full object-cover rounded-md"
            hoverPlay
            muted
            playsInline
            loop
          />
        </div>
        <div className="flex-grow min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="font-medium truncate max-w-[150px]">
                  {displayName}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{video.video.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isOverlayOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[9999] pointer-events-auto"
              style={{ top: overlayPos.top, left: overlayPos.left, width: overlayPos.width, height: overlayPos.height }}
              onMouseEnter={cancelClose}
              onMouseLeave={() => setIsOverlayOpen(false)}
            >
              <div className="w-full h-full rounded-lg shadow-2xl ring-1 ring-primary/20 overflow-hidden bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm">
                <LazyVideo
                  videoUrl={video.video.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  preferUnmuted
                  clickToUnmute
                  playsInline
                  loop
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

interface VideoTypeBadgeProps {
  videoType: string;
}

export function VideoTypeBadge({ videoType }: VideoTypeBadgeProps) {
  return (
    <Badge variant="outline" className="bg-muted/30 border-primary/10">
      {videoType}
    </Badge>
  );
}
