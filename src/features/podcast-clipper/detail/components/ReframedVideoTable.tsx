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
import { Download, Film, ExternalLink } from "lucide-react";
import type { PodcastClipperVideo } from "../../shared/types/podcast-clipper.types";

interface ReframedVideoTableProps {
  videos: PodcastClipperVideo[];
}

export function ReframedVideoTable({ videos }: ReframedVideoTableProps) {
  const reframedVideos = videos.filter((v) => v.reframedVideoUrl);

  if (reframedVideos.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <Film className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-sm font-medium mb-1">No reframed videos yet</h3>
        <p className="text-sm text-muted-foreground">
          Calibrate your folder and reframe videos to see results here.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Video Name</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reframedVideos.map((video) => (
          <TableRow key={video._id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                <span className="font-medium">{video.videoName}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a href={video.reframedVideoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a href={video.reframedVideoUrl} download={`${video.videoName}_reframed.mp4`}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
