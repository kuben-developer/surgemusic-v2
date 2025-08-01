import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, Download, FileVideo, Film, Loader2, ChevronLeft, ChevronRight, List, Grid } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { VideoTableView, ViewToggle, type ViewMode } from "@/features/campaigns/videos";
import type { VideoSectionProps } from "../types/campaign-detail.types";
import type { Doc } from "../../../../../convex/_generated/dataModel";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function VideoSection({
  campaign,
  campaignId,
  generatedVideos,
  isVideosLoading,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  videosPerPage,
  downloadingVideos,
  onDownloadVideo,
  onDownloadAll,
}: VideoSectionProps) {
  if (!campaign) return null;

  // Filter videos based on status
  const getFilteredVideos = () => {
    if (!generatedVideos) return [];
    if (statusFilter === "all") return generatedVideos;
    
    return generatedVideos.filter((video: Doc<"generatedVideos">) => {
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
  };

  const filteredVideos = getFilteredVideos();
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  
  // Prepare videos for current page - only for grid view
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  
  // Calculate total scheduled videos
  const totalScheduledCount = generatedVideos?.filter((video: Doc<"generatedVideos">) => 
    (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
    (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
    (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined)
  ).length || 0;

  const handlePageChange = (pageNumber: number) => {
    onPageChange(pageNumber);
    // Scroll to top of video section
    document.getElementById('videos-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      id="videos-section"
      variants={fadeInUp}
      className="bg-card rounded-xl p-8 shadow-sm border"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-50" />
              <div className="relative bg-primary/10 p-3 rounded-full border border-primary/20">
                <Video className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Generated Videos</h2>
              <p className="text-sm text-muted-foreground">
                {filteredVideos.length} videos available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="unscheduled">Unscheduled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

            {filteredVideos.length > 0 && (
              <Button
                variant="outline"
                onClick={onDownloadAll}
                className="gap-2 bg-background/50 hover:bg-background border-primary/20 hover:border-primary/40"
              >
                <Download className="w-4 h-4" />
                Download All
              </Button>
            )}
          </div>
        </div>

        {/* Pagination - Now at top, only for grid view */}
        {totalPages > 1 && viewMode !== "table" && (
          <div className="mb-6 mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 bg-background/50 border-primary/20 hover:border-primary/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {(() => {
                // Logic to determine which page numbers to show
                const pageButtons = [];
                const maxButtonsToShow = 10; // Adjust as needed
                const ellipsis = (key: string) => (
                  <div key={key} className="px-2 text-muted-foreground">
                    ...
                  </div>
                );
                
                // Always show first page
                pageButtons.push(
                  <Button
                    key={1}
                    variant={currentPage === 1 ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    className={cn(
                      "h-9 w-9",
                      currentPage === 1 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background/50 border-primary/20 hover:border-primary/40"
                    )}
                  >
                    1
                  </Button>
                );
                
                // Calculate the range of pages to show around current page
                let startPage = Math.max(2, currentPage - Math.floor(maxButtonsToShow / 2));
                let endPage = Math.min(totalPages - 1, startPage + maxButtonsToShow - 3);
                
                if (endPage - startPage < maxButtonsToShow - 3) {
                  startPage = Math.max(2, endPage - (maxButtonsToShow - 3) + 1);
                }
                
                // Add ellipsis if there's a gap after first page
                if (startPage > 2) {
                  pageButtons.push(ellipsis('start-ellipsis'));
                }
                
                // Add the middle pages
                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="icon"
                      onClick={() => handlePageChange(i)}
                      className={cn(
                        "h-9 w-9",
                        currentPage === i 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background/50 border-primary/20 hover:border-primary/40"
                      )}
                    >
                      {i}
                    </Button>
                  );
                }
                
                // Add ellipsis if there's a gap before last page
                if (endPage < totalPages - 1) {
                  pageButtons.push(ellipsis('end-ellipsis'));
                }
                
                // Always show last page if there are more than 1 page
                if (totalPages > 1) {
                  pageButtons.push(
                    <Button
                      key={totalPages}
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="icon"
                      onClick={() => handlePageChange(totalPages)}
                      className={cn(
                        "h-9 w-9",
                        currentPage === totalPages 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background/50 border-primary/20 hover:border-primary/40"
                      )}
                    >
                      {totalPages}
                    </Button>
                  );
                }
                
                return pageButtons;
              })()}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 bg-background/50 border-primary/20 hover:border-primary/40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isVideosLoading ? (
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
        ) : !generatedVideos?.length ? (
          <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-primary/[0.02]" />
            <div className="relative py-16 text-center">
              <FileVideo className="w-16 h-16 mx-auto text-primary/40" />
              <h3 className="mt-4 text-xl font-semibold text-foreground/80">No videos generated yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Videos will appear here once generated</p>
            </div>
          </div>
        ) : viewMode === "table" ? (
          <VideoTableView
            videos={filteredVideos}
            downloadingVideos={downloadingVideos}
            handleDownloadVideo={onDownloadVideo}
            handleDownloadAll={onDownloadAll}
            songName={campaign.songName}
            artistName={campaign.artistName}
            genre={campaign.genre}
            statusFilter={statusFilter}
            totalVideosCount={filteredVideos.length}
            totalScheduledCount={totalScheduledCount}
            campaignId={campaignId}
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {currentVideos.map((video: Doc<"generatedVideos">, index: number) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-primary/10 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="aspect-[9/16] bg-muted/30 relative overflow-hidden">
                  <video
                    src={video.video.url}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] relative z-10"
                    controls
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 gap-2 px-3 py-1.5 bg-background/50 backdrop-blur-md border-primary/20 z-20"
                  >
                    <Film className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">{video.video.type}</span>
                  </Badge>
                </div>
                <div className="p-4 space-y-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-medium truncate cursor-help">
                          {video.video.name}
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{video.video.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-2 bg-primary/5 hover:bg-primary/10 text-foreground border-primary/10 hover:border-primary/30 transition-colors"
                    onClick={() => onDownloadVideo(video.video.url, video.video.name, String(video._id))}
                    disabled={downloadingVideos[String(video._id)]}
                  >
                    {downloadingVideos[String(video._id)] ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}