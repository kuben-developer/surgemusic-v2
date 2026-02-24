"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Video } from "lucide-react";
import { VideoStatusBadge } from "../../shared/components/StatusBadge";
import type { PodcastClipperVideo, PodcastVideoId } from "../../shared/types/podcast-clipper.types";

interface VideoTableProps {
  videos: PodcastClipperVideo[];
  selectedVideoIds: Set<string>;
  onToggleSelect: (videoId: string) => void;
  onToggleSelectAll: () => void;
  onDeleteVideo: (videoId: PodcastVideoId) => void;
}

export function VideoTable({
  videos,
  selectedVideoIds,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteVideo,
}: VideoTableProps) {
  const uploadedVideos = videos.filter((v) => !v.reframedVideoUrl);

  if (uploadedVideos.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <Video className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-sm font-medium mb-1">No input videos</h3>
        <p className="text-sm text-muted-foreground">Upload videos to get started.</p>
      </div>
    );
  }

  const allSelected = uploadedVideos.length > 0 && uploadedVideos.every((v) => selectedVideoIds.has(v._id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onToggleSelectAll}
            />
          </TableHead>
          <TableHead>Video Name</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {uploadedVideos.map((video) => (
          <TableRow key={video._id}>
            <TableCell>
              <Checkbox
                checked={selectedVideoIds.has(video._id)}
                onCheckedChange={() => onToggleSelect(video._id)}
                disabled={video.status === "reframing"}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{video.videoName}</span>
                {video.isReferenceVideo && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    Reference
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <VideoStatusBadge status={video.status} />
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteVideo(video._id)}
                disabled={video.status === "reframing"}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
