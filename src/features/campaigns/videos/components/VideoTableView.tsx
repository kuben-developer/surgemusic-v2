"use client"

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
import type { Doc } from "../../../../../convex/_generated/dataModel";

// Use the actual Doc type from Convex
type VideoData = Doc<"generatedVideos">;

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
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false);

  // Use the custom hook for video selection logic
  const {
    selectedVideos,
    isVideoScheduled,
    getSortedVideos,
    toggleSelectAll,
    toggleSelectVideo,
    clearSelection,
  } = useVideoSelection(videos);

  // Filter videos based on status
  const filteredVideos = videos.filter(video => {
    if (statusFilter === "all") return true;

    if (statusFilter === "posted") {
      return video.tiktokUpload?.status?.isPosted || video.instagramUpload?.status?.isPosted || video.youtubeUpload?.status?.isPosted;
    }

    if (statusFilter === "failed") {
      return video.tiktokUpload?.status?.isFailed || video.instagramUpload?.status?.isFailed || video.youtubeUpload?.status?.isFailed;
    }

    if (statusFilter === "scheduled") {
      const isScheduled = (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
                         (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
                         (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined);
      const isPosted = video.tiktokUpload?.status?.isPosted || video.instagramUpload?.status?.isPosted || video.youtubeUpload?.status?.isPosted;
      const isFailed = video.tiktokUpload?.status?.isFailed || video.instagramUpload?.status?.isFailed || video.youtubeUpload?.status?.isFailed;
      return isScheduled && !isPosted && !isFailed;
    }

    if (statusFilter === "unscheduled") {
      const isScheduled = (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
                         (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
                         (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined);
      const isPosted = video.tiktokUpload?.status?.isPosted || video.instagramUpload?.status?.isPosted || video.youtubeUpload?.status?.isPosted;
      const isFailed = video.tiktokUpload?.status?.isFailed || video.instagramUpload?.status?.isFailed || video.youtubeUpload?.status?.isFailed;
      return !isScheduled && !isPosted && !isFailed;
    }

    return true;
  });

  const sortedVideos = getSortedVideos(filteredVideos);

  // Generate caption for a video
  const generateCaption = () => {
    return `${songName} by ${artistName} #${genre}`;
  };

  // Handle schedule button click
  const handleScheduleClick = () => {
    setIsScheduleDialogOpen(true);
  };

  // Handle download selected videos
  const handleDownloadSelected = async () => {
    if (selectedVideos.length === 0) return;

    setIsDownloadingSelected(true);

    try {
      // Get the selected video objects
      const videosToDownload = videos.filter(video =>
        selectedVideos.includes(String(video._id))
      );

      // If there's only one video, download it directly
      if (videosToDownload.length === 1) {
        const video = videosToDownload[0];
        if (video && video.video.url && video.video.name) {
          await handleDownloadVideo(video.video.url, video.video.name, String(video._id));
        }
      } else {
        // Download all selected videos as a zip file
        await handleDownloadAll(videosToDownload);
      }
    } catch (error) {
      console.error("Error downloading selected videos:", error);
    } finally {
      setIsDownloadingSelected(false);
    }
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
        onDownloadSelected={handleDownloadSelected}
        onClearSelection={clearSelection}
        onScheduleClick={handleScheduleClick}
        generateCaption={generateCaption}
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