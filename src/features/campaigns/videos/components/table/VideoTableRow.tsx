"use client"

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useVideoRowData } from "./useVideoRowData";
import { VideoRowSelection } from "./VideoRowSelection";
import { VideoInfo, VideoTypeBadge } from "./VideoInfo";
import { PlatformActions } from "./PlatformActions";
import { ScheduledDate } from "./ScheduledDate";
import { VideoActions } from "./VideoActions";
import type { Doc } from "../../../../../../convex/_generated/dataModel";
import { themeFlags } from "../../../shared/constants";

interface VideoTableRowProps {
  video: Doc<"generatedVideos">;
  isSelected: boolean;
  isScheduled: boolean;
  downloadingVideos: { [key: string]: boolean };
  onToggleSelect: (id: string, event?: React.MouseEvent | MouseEvent) => void;
  onDownload: (videoUrl: string, videoName: string, videoId: string) => void;
  showRowDownload?: boolean;
}

export function VideoTableRow({
  video,
  isSelected,
  isScheduled,
  downloadingVideos,
  onToggleSelect,
  onDownload,
  showRowDownload = true,
}: VideoTableRowProps) {
  const { scheduledDate, hasAnyPlatformUploads, displayName } = useVideoRowData({ video });

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
        <VideoRowSelection
          video={video}
          isSelected={isSelected}
          isScheduled={isScheduled}
          onToggleSelect={onToggleSelect}
        />
      </TableCell>

      <TableCell>
        <VideoInfo video={video} displayName={themeFlags[video.video.type.toLowerCase()] || "Unknown"} />
      </TableCell>

      <TableCell>
        <VideoTypeBadge videoType={themeFlags[video.video.type.toLowerCase()] || "Unknown"} />
      </TableCell>

      <TableCell>
        <PlatformActions
          video={video}
          hasAnyPlatformUploads={hasAnyPlatformUploads}
        />
      </TableCell>

      <TableCell>
        <ScheduledDate scheduledDate={scheduledDate} />
      </TableCell>

      <TableCell>
        {showRowDownload ? (
          <VideoActions
            video={video}
            downloadingVideos={downloadingVideos}
            onDownload={onDownload}
          />
        ) : null}
      </TableCell>
    </TableRow>
  );
}
