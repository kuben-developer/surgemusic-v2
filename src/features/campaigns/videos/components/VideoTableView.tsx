"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Film } from "lucide-react";
import { UnscheduleDialog } from "../dialogs/UnscheduleDialog";
import { 
  VideoTableHeader, 
  VideoTableRow, 
  useVideoSelection 
} from "./table";
import { filterVideosByStatus, generateVideoCaption } from "../utils/video-status.utils";
import { useVideoTableActions } from "../hooks/useVideoTableActions";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type VideoData = Doc<"generatedVideos">;;

interface VideoTableViewProps {
  videos: VideoData[];
  downloadingVideos: { [key: string]: boolean };
  handleDownloadVideo: (videoUrl: string, videoName: string, videoId: string) => void;
  handleDownloadAll: (videos: VideoData[]) => Promise<void>;
  songName: string;
  artistName: string;
  genre: string;
  statusFilter?: string;
  totalVideosCount: number;
  totalScheduledCount: number;
  campaignId: string;
}

export function VideoTableView({
  videos,
  downloadingVideos,
  handleDownloadVideo,
  handleDownloadAll,
  songName,
  artistName,
  genre,
  statusFilter = "all",
  totalVideosCount,
  totalScheduledCount,
  campaignId
}: VideoTableViewProps) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isUnscheduleDialogOpen, setIsUnscheduleDialogOpen] = useState(false);

  // Use custom hooks for video logic
  const {
    selectedVideos,
    isVideoScheduled,
    getSortedVideos,
    toggleSelectAll,
    toggleSelectVideo,
    clearSelection,
  } = useVideoSelection(videos);

  const {
    isDownloadingSelected,
    handleDownloadSelected,
  } = useVideoTableActions({ videos, handleDownloadVideo, handleDownloadAll });

  // Filter videos based on status using utility function
  const filteredVideos = filterVideosByStatus(videos, statusFilter);

  const sortedVideos = getSortedVideos(filteredVideos);

  // Generate caption for videos
  const videoCaption = generateVideoCaption(songName, artistName, genre);

  // Handle schedule button click
  const handleScheduleClick = () => {
    setIsScheduleDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with actions and filters */}
      <VideoTableHeader
        selectedVideos={selectedVideos}
        videos={videos}
        totalVideosCount={totalVideosCount}
        totalScheduledCount={totalScheduledCount}
        statusFilter={statusFilter}
        isScheduleDialogOpen={isScheduleDialogOpen}
        isUnscheduleDialogOpen={isUnscheduleDialogOpen}
        isDownloadingSelected={isDownloadingSelected}
        onScheduleDialogChange={setIsScheduleDialogOpen}
        onUnscheduleDialogChange={setIsUnscheduleDialogOpen}
        onDownloadSelected={() => handleDownloadSelected(selectedVideos)}
        onClearSelection={clearSelection}
        onScheduleClick={handleScheduleClick}
        generateCaption={() => videoCaption}
      />

      {/* Table */}
      <div className="rounded-xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedVideos.length === filteredVideos.length && filteredVideos.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all videos"
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px]">Video Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="min-w-[320px]">Social Platforms & Status</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Film className="h-8 w-8 mb-2 opacity-40" />
                        <p className="text-sm">
                          {statusFilter !== "all" 
                            ? `No ${statusFilter} videos available` 
                            : "Videos will appear here once generated"
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedVideos.map((video) => (
                    <VideoTableRow
                      key={video._id}
                      video={video}
                      isSelected={selectedVideos.includes(String(video._id))}
                      isScheduled={isVideoScheduled(video)}
                      downloadingVideos={downloadingVideos}
                      onToggleSelect={toggleSelectVideo}
                      onDownload={handleDownloadVideo}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Unschedule Dialog */}
      <UnscheduleDialog
        isOpen={isUnscheduleDialogOpen}
        onOpenChange={setIsUnscheduleDialogOpen}
        campaignId={campaignId}
      />
    </div>
  );
}