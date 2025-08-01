"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, Download, Loader2 } from "lucide-react";
import { LazyVideo } from "./LazyVideo";
import { PlatformStatusBadge } from "./PlatformStatusBadge";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface VideoTableRowProps {
  video: Doc<"generatedVideos">;
  isSelected: boolean;
  isScheduled: boolean;
  downloadingVideos: { [key: string]: boolean };
  onToggleSelect: (id: string, event?: React.MouseEvent | MouseEvent) => void;
  onDownload: (videoUrl: string, videoName: string, videoId: string) => void;
}

export function VideoTableRow({
  video,
  isSelected,
  isScheduled,
  downloadingVideos,
  onToggleSelect,
  onDownload,
}: VideoTableRowProps) {
  
  // Get the scheduled date (first available from any platform)
  const getScheduledDate = () => {
    const scheduledAt = video.tiktokUpload?.scheduledAt || 
                      video.instagramUpload?.scheduledAt || 
                      video.youtubeUpload?.scheduledAt;
    return scheduledAt ? new Date(scheduledAt) : null;
  };

  const scheduledDate = getScheduledDate();

  return (
    <TableRow 
      className={cn(
        "group cursor-pointer transition-colors",
        isSelected && "bg-muted/50",
        isScheduled && "opacity-80 cursor-not-allowed"
      )}
      onClick={(e) => {
        // Only handle click if not on a button or link
        const target = e.target as HTMLElement;
        if (
          !target.closest('button') && 
          !target.closest('a') && 
          !target.closest('input[type="checkbox"]') &&
          !isScheduled
        ) {
          onToggleSelect(String(video._id), e);
        }
      }}
    >
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            // Get the current event to check for shift key
            const event = window.event as MouseEvent | undefined;
            onToggleSelect(String(video._id), event);
          }}
          onClick={(e) => {
            // Prevent default checkbox behavior to handle shift-click ourselves
            if (e.shiftKey) {
              e.preventDefault();
              onToggleSelect(String(video._id), e);
            }
          }}
          aria-label={`Select ${video.video.name}`}
          disabled={isScheduled}
        />
      </TableCell>
      
      <TableCell>
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
                    {video.video.name.replace(/\.[^/.]+$/, "")}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{video.video.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline" className="bg-muted/30 border-primary/10">
          {video.video.type}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col gap-2">
          {(['tiktok', 'instagram', 'youtube'] as const).map(platform => (
            <PlatformStatusBadge
              key={platform}
              platform={platform}
              video={video}
            />
          )).filter(Boolean)}
          
          {/* Show message if no platforms scheduled */}
          {!video.tiktokUpload && !video.instagramUpload && !video.youtubeUpload && (
            <span className="text-xs text-muted-foreground">Not scheduled</span>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        {scheduledDate ? (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">
                {format(scheduledDate, "MMM d, yyyy")}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(scheduledDate, "h:mm a")}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(video.video.url, video.video.name, String(video._id));
          }}
          disabled={downloadingVideos[String(video._id)]}
          title="Download video"
        >
          {downloadingVideos[String(video._id)] ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}