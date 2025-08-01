import { FileVideo } from "lucide-react";
import { motion } from "framer-motion";
import { VideoTableView } from "@/features/campaigns/videos";
import { VideoGridItem } from "./VideoGridItem";
import type { Doc } from "../../../../../convex/_generated/dataModel";

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface VideoSectionContentProps {
  isVideosLoading: boolean;
  generatedVideos?: Doc<"generatedVideos">[];
  filteredVideos: Doc<"generatedVideos">[];
  currentVideos: Doc<"generatedVideos">[];
  viewMode: "table" | "grid";
  downloadingVideos: Record<string, boolean>;
  onDownloadVideo: (url: string, name: string, id: string) => void;
  onDownloadAll: () => void;
  campaign?: Doc<"campaigns">;
  campaignId: string;
  statusFilter: string;
  totalScheduledCount: number;
}

export function VideoSectionContent({
  isVideosLoading,
  generatedVideos,
  filteredVideos,
  currentVideos,
  viewMode,
  downloadingVideos,
  onDownloadVideo,
  onDownloadAll,
  campaign,
  campaignId,
  statusFilter,
  totalScheduledCount,
}: VideoSectionContentProps) {
  if (isVideosLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[9/16] rounded-xl bg-muted/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-muted/20 rounded animate-pulse" />
              <div className="h-8 w-full bg-muted/20 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!generatedVideos?.length) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-primary/[0.02]" />
        <div className="relative py-16 text-center">
          <FileVideo className="w-16 h-16 mx-auto text-primary/40" />
          <h3 className="mt-4 text-xl font-semibold text-foreground/80">No videos generated yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Videos will appear here once generated</p>
        </div>
      </div>
    );
  }

  if (viewMode === "table") {
    return (
      <VideoTableView
        videos={filteredVideos}
        downloadingVideos={downloadingVideos}
        handleDownloadVideo={onDownloadVideo}
        handleDownloadAll={onDownloadAll}
        songName={campaign?.songName || ""}
        artistName={campaign?.artistName || ""}
        genre={campaign?.genre || ""}
        statusFilter={statusFilter}
        totalVideosCount={filteredVideos.length}
        totalScheduledCount={totalScheduledCount}
        campaignId={campaignId}
      />
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      variants={staggerContainer}
    >
      {currentVideos.map((video: Doc<"generatedVideos">, index: number) => (
        <VideoGridItem
          key={index}
          video={video}
          index={index}
          isDownloading={downloadingVideos[String(video._id)] || false}
          onDownload={onDownloadVideo}
        />
      ))}
    </motion.div>
  );
}