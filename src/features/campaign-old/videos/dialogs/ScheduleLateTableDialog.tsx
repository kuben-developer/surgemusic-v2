"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VideoTableRow } from "../components/table/VideoTableRow";
import { ScheduleLateDialog } from "./ScheduleLateDialog";
import { filterVideosByStatus, getVideoStatusFlags } from "../utils/video-status.utils";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface ScheduleLateTableDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  videos: Doc<"generatedVideos">[];
  downloadingVideos: Record<string, boolean>;
  handleDownloadVideo: (url: string, name: string, id: string) => void;
  songName: string;
  artistName: string;
  genre: string;
  statusFilter: string;
  totalVideosCount: number;
  campaignId: string;
  showTrialOverlay?: boolean;
}

export function ScheduleLateTableDialog({
  isOpen,
  onOpenChange,
  videos,
  downloadingVideos,
  handleDownloadVideo,
  songName,
  artistName,
  genre,
  statusFilter,
  totalVideosCount,
  campaignId,
  showTrialOverlay = false,
}: ScheduleLateTableDialogProps) {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isScheduleLateDialogOpen, setIsScheduleLateDialogOpen] = useState(false);

  const filteredVideos = filterVideosByStatus(videos, statusFilter);

  const toggleSelectVideo = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVideos.length === filteredVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(filteredVideos.map(v => String(v._id)));
    }
  };

  const handleScheduleClick = () => {
    if (selectedVideos.length > 0) {
      setIsScheduleLateDialogOpen(true);
    }
  };

  const isVideoScheduled = (video: Doc<"generatedVideos">) => {
    const { isScheduled } = getVideoStatusFlags(video);
    return isScheduled;
  };

  const generateCaption = () => {
    return `${songName} by ${artistName} | ${genre} | Made with Surge Light`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select videos to schedule with Late</DialogTitle>
            <DialogDescription>
              Choose the videos you want to schedule using Late API.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            {/* Selection Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                {selectedVideos.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{selectedVideos.length} selected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedVideos([])}
                    >
                      Clear selection
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {totalVideosCount} videos {statusFilter !== "all" ? `(${statusFilter})` : "total"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedVideos.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleScheduleClick}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Schedule with Late
                  </Button>
                )}
              </div>
            </div>

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
                        filteredVideos.map((video) => (
                          <VideoTableRow
                            key={video._id}
                            video={video}
                            isSelected={selectedVideos.includes(String(video._id))}
                            isScheduled={isVideoScheduled(video)}
                            downloadingVideos={downloadingVideos}
                            onToggleSelect={toggleSelectVideo}
                            onDownload={handleDownloadVideo}
                            showRowDownload={false}
                            showTrialOverlay={showTrialOverlay}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Late Schedule Dialog */}
      <ScheduleLateDialog
        isOpen={isScheduleLateDialogOpen}
        onOpenChange={setIsScheduleLateDialogOpen}
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
  );
}
