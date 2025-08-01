"use client"

import type { Doc, Id } from "../../../../../convex/_generated/dataModel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  CalendarX,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Film,
  Loader2,
  Users
} from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { ScheduleDialog } from "../dialogs/ScheduleDialog"
import { UnscheduleDialog } from "../dialogs/UnscheduleDialog"

// Lazy loading video component
const LazyVideo = ({ videoUrl, className }: { videoUrl: string, className: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    if (!videoRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 } // When 10% of the element is visible
    );
    
    observer.observe(videoRef.current);
    
    return () => {
      if (videoRef.current) observer.disconnect();
    };
  }, [videoRef]);
  
  return (
    <video
      ref={videoRef}
      src={isInView ? videoUrl : undefined}
      className={className}
      // Only add control attributes when it's in view and loaded
      {...(isInView ? { controls: false } : {})}
    />
  );
};

// Use the actual Doc type from Convex
type VideoData = Doc<"generatedVideos">

interface VideoTableViewProps {
  videos: VideoData[]
  downloadingVideos: { [key: string]: boolean }
  handleDownloadVideo: (videoUrl: string, videoName: string, videoId: string) => void
  handleDownloadAll: (videos: VideoData[]) => Promise<void>
  songName: string
  artistName: string
  genre: string
  statusFilter?: string
  totalVideosCount: number
  totalScheduledCount: number
  campaignId: string
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
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isUnscheduleDialogOpen, setIsUnscheduleDialogOpen] = useState(false)
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false)
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

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

  // Sort videos by scheduled date (most recent first, then unscheduled)
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    // Get scheduled dates from any platform
    const aScheduledAt = a.tiktokUpload?.scheduledAt || a.instagramUpload?.scheduledAt || a.youtubeUpload?.scheduledAt;
    const bScheduledAt = b.tiktokUpload?.scheduledAt || b.instagramUpload?.scheduledAt || b.youtubeUpload?.scheduledAt;
    
    // If both have schedules, compare dates (most recent first)
    if (aScheduledAt && bScheduledAt) {
      return bScheduledAt - aScheduledAt;
    }
    // If only a has a schedule, a comes first
    if (aScheduledAt) return -1;
    // If only b has a schedule, b comes first
    if (bScheduledAt) return 1;
    // If neither has a schedule, sort by creation date (most recent first)
    return b._creationTime - a._creationTime;
  });

  // Generate caption for a video
  const generateCaption = () => {
    return `${songName} by ${artistName} #${genre}`
  }

  // Toggle select all videos
  const toggleSelectAll = () => {
    // Filter out scheduled videos
    const selectableVideos = videos.filter(video => !isVideoScheduled(video));

    if (selectedVideos.length === selectableVideos.length && selectableVideos.length > 0) {
      setSelectedVideos([])
      setLastSelectedIndex(null)
    } else {
      setSelectedVideos(selectableVideos.map(video => String(video._id)))
      setLastSelectedIndex(null)
    }
  }

  // Toggle select individual video with shift-click support
  const toggleSelectVideo = (id: string, event?: React.MouseEvent | MouseEvent) => {
    // Find the video by id and its index in sortedVideos
    const video = videos.find(v => String(v._id) === id);
    const currentIndex = sortedVideos.findIndex(v => String(v._id) === id);

    // Don't allow selection if the video is already scheduled
    if (video && isVideoScheduled(video)) {
      return;
    }

    // Handle shift-click for range selection
    if (event?.shiftKey && lastSelectedIndex !== null && currentIndex !== -1) {
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      
      // Get all videos in the range that are not scheduled
      const rangeVideos = sortedVideos
        .slice(start, end + 1)
        .filter(v => !isVideoScheduled(v))
        .map(v => String(v._id));
      
      // Add range videos to selection (union of existing and new)
      const newSelection = Array.from(new Set([...selectedVideos, ...rangeVideos]));
      setSelectedVideos(newSelection);
    } else {
      // Normal click behavior
      if (selectedVideos.includes(id)) {
        setSelectedVideos(selectedVideos.filter(videoId => videoId !== id));
      } else {
        setSelectedVideos([...selectedVideos, id]);
      }
      setLastSelectedIndex(currentIndex);
    }
  }

  // Get platform icon based on platform
  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <InstagramIcon className="h-4 w-4 text-pink-500" />
      case 'tiktok':
        return <TikTokIcon className="h-4 w-4" />
      case 'youtube':
        return <YouTubeIcon className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Get platform-specific badge styles
  const getPlatformBadgeClass = (platform?: string, status?: 'posted' | 'scheduled' | 'failed') => {
    if (status === 'posted') {
      return "bg-emerald-50/30 border-emerald-200 text-emerald-600 dark:bg-emerald-950/10 dark:border-emerald-900/20 dark:text-emerald-400";
    } else if (status === 'scheduled') {
      return "bg-amber-50/30 border-amber-200 text-amber-600 dark:bg-amber-950/10 dark:border-amber-900/20 dark:text-amber-400";
    } else if (status === 'failed') {
      return "bg-red-50/30 border-red-200 text-red-600 dark:bg-red-950/10 dark:border-red-900/20 dark:text-red-400";
    } else {
      return "bg-muted/10 border-muted/20 text-foreground";
    }
  }

  // Check if video is scheduled
  const isVideoScheduled = (video: VideoData) => {
    return (video.tiktokUpload?.scheduledAt !== undefined && video.tiktokUpload?.scheduledAt !== null) ||
           (video.instagramUpload?.scheduledAt !== undefined && video.instagramUpload?.scheduledAt !== null) ||
           (video.youtubeUpload?.scheduledAt !== undefined && video.youtubeUpload?.scheduledAt !== null)
  }

  // Handle schedule button click
  const handleScheduleClick = () => {
    setIsScheduleDialogOpen(true)
  }

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {selectedVideos.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedVideos.length} selected</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSelectedVideos([])
                  setLastSelectedIndex(null)
                }}
              >
                Clear selection
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{totalVideosCount} videos {statusFilter !== "all" ? `(${statusFilter})` : "total"}</span>
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
              onClick={() => setIsUnscheduleDialogOpen(true)}
            >
              <CalendarX className="h-4 w-4" />
              Unschedule Posts
            </Button>
          )}

          {selectedVideos.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleDownloadSelected}
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

              <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleScheduleClick}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Schedule Selected
                  </Button>
                </DialogTrigger>
                <ScheduleDialog
                  isOpen={isScheduleDialogOpen}
                  onOpenChange={setIsScheduleDialogOpen}
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
              </Dialog>
            </>
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
                        <Film className="h-8 w-8 mb-2 opacity-40" />
                        <p className="text-sm">{statusFilter !== "all" ? `No ${statusFilter} videos available` : "Videos will appear here once generated"}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedVideos.map((video, index) => {
                    return (
                      <TableRow 
                        key={video._id} 
                        className={cn(
                          "group cursor-pointer transition-colors",
                          selectedVideos.includes(String(video._id)) && "bg-muted/50",
                          isVideoScheduled(video) && "opacity-80 cursor-not-allowed"
                        )}
                        onClick={(e) => {
                          // Only handle click if not on a button or link
                          const target = e.target as HTMLElement;
                          if (
                            !target.closest('button') && 
                            !target.closest('a') && 
                            !target.closest('input[type="checkbox"]') &&
                            !isVideoScheduled(video)
                          ) {
                            toggleSelectVideo(String(video._id), e);
                          }
                        }}>
                        <TableCell>
                          <Checkbox
                            checked={selectedVideos.includes(String(video._id))}
                            onCheckedChange={(checked) => {
                              // Get the current event to check for shift key
                              const event = window.event as MouseEvent | undefined;
                              toggleSelectVideo(String(video._id), event);
                            }}
                            onClick={(e) => {
                              // Prevent default checkbox behavior to handle shift-click ourselves
                              if (e.shiftKey) {
                                e.preventDefault();
                                toggleSelectVideo(String(video._id), e);
                              }
                            }}
                            aria-label={`Select ${video.video.name}`}
                            disabled={isVideoScheduled(video)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-7 overflow-hidden rounded-md bg-muted/20 flex-shrink-0">
                              <LazyVideo
                                videoUrl={video.video.url}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="font-medium truncate max-w-[150px]">
                                      {video.video.name.replace(/\.[^/.]+$/, "")}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{video.video.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/30 border-primary/10">
                            {video.video.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            // Create a set to track which platforms are displayed
                            const displayedPlatforms = new Set<string>();

                            // Track if we have any content to display
                            let hasContent = false;

                            return (
                              <div className="flex flex-col gap-3">
                                {/* Platforms Section */}
                                <div className="flex flex-col flex-wrap gap-2">
                                  {['tiktok', 'instagram', 'youtube'].map(platform => {
                                    let shouldDisplay = false;
                                    let status: 'posted' | 'scheduled' | 'failed' | undefined = undefined;
                                    let statusIcon = <Clock className="h-3 w-3" />;
                                    let statusText = "Scheduled";
                                    let failedReason: string | null = null;
                                    let statusLink: string | null = null;

                                    // Check platform status
                                    if (platform === 'tiktok') {
                                      if (video.tiktokUpload?.status?.isPosted) {
                                        shouldDisplay = true;
                                        status = 'posted';
                                        statusIcon = <CheckCircle2 className="h-3 w-3" />;
                                        statusText = "Posted";
                                        statusLink = video.tiktokUpload?.post?.url || null;
                                      } else if (video.tiktokUpload?.status?.isFailed) {
                                        shouldDisplay = true;
                                        status = 'failed';
                                        statusIcon = <AlertCircle className="h-3 w-3" />;
                                        statusText = "Failed";
                                        failedReason = video.tiktokUpload?.status?.failedReason || null;
                                      } else if (video.tiktokUpload?.scheduledAt) {
                                        shouldDisplay = true;
                                        status = 'scheduled';
                                      }
                                    } else if (platform === 'instagram') {
                                      if (video.instagramUpload?.status?.isPosted) {
                                        shouldDisplay = true;
                                        status = 'posted';
                                        statusIcon = <CheckCircle2 className="h-3 w-3" />;
                                        statusText = "Posted";
                                        statusLink = video.instagramUpload?.post?.url || null;
                                      } else if (video.instagramUpload?.status?.isFailed) {
                                        shouldDisplay = true;
                                        status = 'failed';
                                        statusIcon = <AlertCircle className="h-3 w-3" />;
                                        statusText = "Failed";
                                        failedReason = video.instagramUpload?.status?.failedReason || null;
                                      } else if (video.instagramUpload?.scheduledAt) {
                                        shouldDisplay = true;
                                        status = 'scheduled';
                                      }
                                    } else if (platform === 'youtube') {
                                      if (video.youtubeUpload?.status?.isPosted) {
                                        shouldDisplay = true;
                                        status = 'posted';
                                        statusIcon = <CheckCircle2 className="h-3 w-3" />;
                                        statusText = "Posted";
                                        statusLink = video.youtubeUpload?.post?.url || null;
                                      } else if (video.youtubeUpload?.status?.isFailed) {
                                        shouldDisplay = true;
                                        status = 'failed';
                                        statusIcon = <AlertCircle className="h-3 w-3" />;
                                        statusText = "Failed";
                                        failedReason = video.youtubeUpload?.status?.failedReason || null;
                                      } else if (video.youtubeUpload?.scheduledAt) {
                                        shouldDisplay = true;
                                        status = 'scheduled';
                                      }
                                    }

                                    if (shouldDisplay) {
                                      hasContent = true;

                                      // Check if this platform has upload data
                                      const hasUpload = 
                                        (platform === 'tiktok' && video.tiktokUpload) ||
                                        (platform === 'instagram' && video.instagramUpload) ||
                                        (platform === 'youtube' && video.youtubeUpload);

                                      // Text color based on platform
                                      const textColorClass = platform === 'instagram'
                                        ? 'text-pink-500'
                                        : platform === 'youtube'
                                          ? 'text-red-500'
                                          : '';

                                      return (
                                        <div key={platform} className="flex items-center">
                                          {/* Create a reusable badge for both cases (failed and normal) */}
                                          <TooltipProvider delayDuration={100}>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Badge variant="outline" className={`h-6 px-2 w-36 rounded-md cursor-pointer flex items-center gap-1.5 ${getPlatformBadgeClass(undefined, status)} hover:brightness-105 transition-colors`}>
                                                  <div className={`flex-shrink-0 mr-3 flex items-center justify-center ${textColorClass}`}>
                                                    {platform === 'tiktok' && <TikTokIcon className="h-4 w-4" />}
                                                    {platform === 'instagram' && <InstagramIcon className="h-4 w-4" />}
                                                    {platform === 'youtube' && <YouTubeIcon className="h-4 w-4" />}
                                                  </div>
                                                  {statusIcon}
                                                  <span className="text-xs flex items-center gap-1">
                                                    {statusText}
                                                    {statusLink && (
                                                      <a
                                                        href={statusLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-primary transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        <ExternalLink className="h-3 w-3" />
                                                      </a>
                                                    )}
                                                  </span>
                                                </Badge>
                                              </TooltipTrigger>
                                              <TooltipContent side="right" align="center" className="p-2.5 bg-background/95 backdrop-blur-sm border shadow-lg rounded-lg max-w-[240px]">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <div className="flex-shrink-0 w-5 h-5 flex justify-center items-center bg-background/80 rounded-full p-1 ring-1 ring-primary/10">
                                                    {platform === 'tiktok' && <TikTokIcon className="h-3.5 w-3.5" />}
                                                    {platform === 'instagram' && <InstagramIcon className="h-3.5 w-3.5 text-pink-500" />}
                                                    {platform === 'youtube' && <YouTubeIcon className="h-3.5 w-3.5 text-red-500" />}
                                                  </div>
                                                  <span className="text-sm font-medium text-foreground capitalize">{platform}</span>
                                                </div>

                                                {/* Add failed reason inside the tooltip if it exists */}
                                                {failedReason && (
                                                  <div className="mb-2 bg-red-50/30 text-red-500 dark:bg-red-950/10 dark:text-red-400 px-2 py-1.5 rounded-md border border-red-200/30 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                                      <span className="font-medium">{failedReason}</span>
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Account info not available in current data structure */}
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>

                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>

                                {!hasContent && (
                                  <span className="text-muted-foreground text-sm">No platforms assigned</span>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const scheduledAt = video.tiktokUpload?.scheduledAt || video.instagramUpload?.scheduledAt || video.youtubeUpload?.scheduledAt;
                            if (scheduledAt) {
                              return (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span>{format(new Date(scheduledAt), "MMM d, yyyy h:mm a")}</span>
                                </div>
                              );
                            }
                            return <span className="text-muted-foreground">Not scheduled</span>;
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadVideo(video.video.url, video.video.name, String(video._id))}
                            disabled={downloadingVideos[String(video._id)]}
                            className="h-8 w-8 mr-2"
                          >
                            {downloadingVideos[String(video._id)] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            <span className="sr-only">Download</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
        onUnscheduleComplete={() => {
          // Optionally refresh the video list or show a success message
          setIsUnscheduleDialogOpen(false)
        }}
      />
    </div>
  )
}

// SVG Icons for platforms
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-black dark:text-white", className)}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" fill="currentColor" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-pink-500", className)}>
    <path d="M8 1.44144C10.136 1.44144 10.3893 1.44144 11.2327 1.49078C12.0127 1.53078 12.4327 1.67078 12.7193 1.79078C13.0727 1.94144 13.3593 2.13078 13.636 2.40744C13.9127 2.68411 14.1127 2.97078 14.2527 3.32411C14.3727 3.61078 14.5127 4.03078 14.5527 4.81078C14.6027 5.65411 14.6027 5.90744 14.6027 8.04344C14.6027 10.1794 14.6027 10.4328 14.5527 11.2761C14.5127 12.0561 14.3727 12.4761 14.2527 12.7628C14.1027 13.1161 13.9127 13.4028 13.636 13.6794C13.3593 13.9561 13.0727 14.1561 12.7193 14.2961C12.4327 14.4161 12.0127 14.5561 11.2327 14.5961C10.3893 14.6461 10.136 14.6461 8 14.6461C5.864 14.6461 5.61067 14.6461 4.76733 14.5961C3.98733 14.5561 3.56733 14.4161 3.28067 14.2961C2.92733 14.1461 2.64067 13.9561 2.364 13.6794C2.08733 13.4028 1.88733 13.1161 1.74733 12.7628C1.62733 12.4761 1.48733 12.0561 1.44733 11.2761C1.39733 10.4328 1.39733 10.1794 1.39733 8.04344C1.39733 5.90744 1.39733 5.65411 1.44733 4.81078C1.48733 4.03078 1.62733 3.61078 1.74733 3.32411C1.89733 2.97078 2.08733 2.68411 2.364 2.40744C2.64067 2.13078 2.92733 1.93078 3.28067 1.79078C3.56733 1.67078 3.98733 1.53078 4.76733 1.49078C5.61067 1.44144 5.864 1.44144 8 1.44144ZM8 0.0434418C5.82733 0.0434418 5.55067 0.0434418 4.69733 0.0927751C3.84733 0.142775 3.26733 0.292775 2.76733 0.492775C2.24733 0.702775 1.81733 0.982775 1.39067 1.41078C0.964 1.83744 0.684 2.26744 0.474 2.78744C0.274 3.28744 0.124 3.86744 0.0746667 4.71744C0.0253333 5.57078 0.0253333 5.84744 0.0253333 8.02011C0.0253333 10.1928 0.0253333 10.4694 0.0746667 11.3228C0.124 12.1728 0.274 12.7528 0.474 13.2528C0.684 13.7728 0.964 14.2028 1.39067 14.6294C1.81733 15.0561 2.24733 15.3361 2.76733 15.5461C3.26733 15.7461 3.84733 15.8961 4.69733 15.9461C5.55067 15.9954 5.82733 15.9954 8 15.9954C10.1727 15.9954 10.4493 15.9954 11.3027 15.9461C12.1527 15.8961 12.7327 15.7461 13.2327 15.5461C13.7527 15.3361 14.1827 15.0561 14.6093 14.6294C15.036 14.2028 15.316 13.7728 15.526 13.2528C15.726 12.7528 15.876 12.1728 15.926 11.3228C15.9753 10.4694 15.9753 10.1928 15.9753 8.02011C15.9753 5.84744 15.9753 5.57078 15.926 4.71744C15.876 3.86744 15.726 3.28744 15.526 2.78744C15.316 2.26744 15.036 1.83744 14.6093 1.41078C14.1827 0.984108 13.7527 0.704108 13.2327 0.494108C12.7327 0.294108 12.1527 0.144108 11.3027 0.0941084C10.4493 0.0434418 10.1727 0.0434418 8 0.0434418Z" fill="currentColor" />
    <path d="M8 3.89078C5.73067 3.89078 3.89067 5.73078 3.89067 8.00011C3.89067 10.2694 5.73067 12.1094 8 12.1094C10.2693 12.1094 12.1093 10.2694 12.1093 8.00011C12.1093 5.73078 10.2693 3.89078 8 3.89078ZM8 10.6694C6.52733 10.6694 5.33067 9.47278 5.33067 8.00011C5.33067 6.52744 6.52733 5.33078 8 5.33078C9.47267 5.33078 10.6693 6.52744 10.6693 8.00011C10.6693 9.47278 9.47267 10.6694 8 10.6694Z" fill="currentColor" />
    <path d="M12.2707 4.69078C12.8027 4.69078 13.2333 4.26019 13.2333 3.72811C13.2333 3.19603 12.8027 2.76544 12.2707 2.76544C11.7386 2.76544 11.308 3.19603 11.308 3.72811C11.308 4.26019 11.7386 4.69078 12.2707 4.69078Z" fill="currentColor" />
  </svg>
)

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("text-red-500", className)}>
    <path d="M15.6654 4.27525C15.4814 3.58325 14.9374 3.03925 14.2454 2.85525C13.0054 2.53325 7.99938 2.53325 7.99938 2.53325C7.99938 2.53325 2.99338 2.53325 1.75338 2.85525C1.06138 3.03925 0.517375 3.58325 0.333375 4.27525C0.0113752 5.51525 0.0113752 8.00725 0.0113752 8.00725C0.0113752 8.00725 0.0113752 10.4993 0.333375 11.7393C0.517375 12.4313 1.06138 12.9753 1.75338 13.1593C2.99338 13.4813 7.99938 13.4813 7.99938 13.4813C7.99938 13.4813 13.0054 13.4813 14.2454 13.1593C14.9374 12.9753 15.4814 12.4313 15.6654 11.7393C15.9874 10.4993 15.9874 8.00725 15.9874 8.00725C15.9874 8.00725 15.9874 5.51525 15.6654 4.27525ZM6.39938 10.3873V5.62725L10.5594 8.00725L6.39938 10.3873Z" fill="currentColor" />
  </svg>
) 