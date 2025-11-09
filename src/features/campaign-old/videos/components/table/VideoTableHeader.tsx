"use client"

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// DialogTrigger not used here; ScheduleDialog controls its own Dialog
import {
  CalendarPlus,
  CalendarX,
  Download,
  Loader2,
} from "lucide-react";
import { ScheduleDialog } from "../../dialogs/ScheduleDialog";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface VideoTableHeaderProps {
  selectedVideos: string[];
  videos: Doc<"generatedVideos">[];
  totalVideosCount: number;
  totalScheduledCount: number;
  statusFilter: string;
  isScheduleDialogOpen: boolean;
  isUnscheduleDialogOpen: boolean;
  isDownloadingSelected: boolean;
  onScheduleDialogChange: (open: boolean) => void;
  onUnscheduleDialogChange: (open: boolean) => void;
  onDownloadSelected: () => void;
  onClearSelection: () => void;
  onScheduleClick: () => void;
  generateCaption: () => string;
  showDownloadSelectedButton?: boolean;
}

export function VideoTableHeader({
  selectedVideos,
  videos,
  totalVideosCount,
  totalScheduledCount,
  statusFilter,
  isScheduleDialogOpen,
  isUnscheduleDialogOpen,
  isDownloadingSelected,
  onScheduleDialogChange,
  onUnscheduleDialogChange,
  onDownloadSelected,
  onClearSelection,
  onScheduleClick,
  generateCaption,
  showDownloadSelectedButton = true,
}: VideoTableHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {selectedVideos.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedVideos.length} selected</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onClearSelection}
            >
              Clear selection
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {totalVideosCount} videos {statusFilter !== "all" ? `(${statusFilter})` : "total"}
            </span>
            {totalScheduledCount > 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {totalScheduledCount} scheduled
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {totalScheduledCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onUnscheduleDialogChange(true)}
          >
            <CalendarX className="h-4 w-4" />
            Unschedule Posts
          </Button>
        )}

        {selectedVideos.length > 0 && (
          <>
            {showDownloadSelectedButton && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={onDownloadSelected}
                disabled={isDownloadingSelected}
              >
                {isDownloadingSelected ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Selected
                  </>
                )}
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={onScheduleClick}
            >
              <CalendarPlus className="h-4 w-4" />
              Schedule Selected
            </Button>

            <ScheduleDialog
              isOpen={isScheduleDialogOpen}
              onOpenChange={onScheduleDialogChange}
              selectedVideosCount={selectedVideos.length}
              selectedVideos={selectedVideos.map(id => {
                const video = videos.find(v => String(v._id) === id);
                return {
                  videoUrl: video?.video.url || "",
                  caption: generateCaption(),
                  videoName: video?.video.name || "",
                  videoId: id,
                };
              })}
            />
          </>
        )}
      </div>
    </div>
  );
}
