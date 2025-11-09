"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VideoTableView } from "../components/VideoTableView";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface ScheduleTableDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  videos: Doc<"generatedVideos">[];
  downloadingVideos: Record<string, boolean>;
  handleDownloadVideo: (url: string, name: string, id: string) => void;
  handleDownloadAll: (videos?: Doc<"generatedVideos">[]) => void;
  songName: string;
  artistName: string;
  genre: string;
  statusFilter: string;
  totalVideosCount: number;
  totalScheduledCount: number;
  campaignId: string;
  /** Whether to show trial overlays on individual videos */
  showTrialOverlay?: boolean;
}

export function ScheduleTableDialog({
  isOpen,
  onOpenChange,
  videos,
  downloadingVideos,
  handleDownloadVideo,
  handleDownloadAll,
  songName,
  artistName,
  genre,
  statusFilter,
  totalVideosCount,
  totalScheduledCount,
  campaignId,
  showTrialOverlay = false,
}: ScheduleTableDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select videos to schedule</DialogTitle>
          <DialogDescription>
            Choose the videos you want to schedule. After selection, proceed to scheduling steps.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <VideoTableView
            videos={videos}
            downloadingVideos={downloadingVideos}
            handleDownloadVideo={handleDownloadVideo}
            handleDownloadAll={async (selected) => {
              // Preserve existing behavior: if specific videos provided use them, otherwise all
              if (selected && selected.length > 0) {
                await handleDownloadAll(selected);
              } else {
                await handleDownloadAll();
              }
            }}
            songName={songName}
            artistName={artistName}
            genre={genre}
            statusFilter={statusFilter}
            totalVideosCount={totalVideosCount}
            totalScheduledCount={totalScheduledCount}
            campaignId={campaignId}
            hideDownloads
            showTrialOverlay={showTrialOverlay}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
