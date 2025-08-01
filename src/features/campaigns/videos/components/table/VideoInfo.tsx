"use client";

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
  return (
    <>
      {/* Video preview and name */}
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-7 overflow-hidden rounded-md bg-muted/20 flex-shrink-0">
          <LazyVideo
            videoUrl={video.video.url}
            className="h-full w-full object-cover"
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