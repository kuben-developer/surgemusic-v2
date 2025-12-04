"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useAction } from "convex/react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Upload,
  Video,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useVideoSelection } from "../hooks/useVideoSelection";
import { UnassignVideosDialog } from "../dialogs/UnassignVideosDialog";
import { BulkUploadDialog } from "../dialogs/BulkUploadDialog";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import type { AirtableContent } from "../../shared/types/campaign.types";

const VIDEOS_PER_PAGE = 8;

type MontagerVideo = Doc<"montagerVideos">;
export type GridVariant = "processing" | "ready" | "scheduled" | "published";

// Variant configuration
const VARIANT_CONFIG = {
  processing: {
    icon: Clock,
    label: "Processing",
    badgeClass: "bg-amber-200 text-amber-900 dark:bg-amber-800/50 dark:text-amber-100",
    headerIcon: Clock,
    headerIconClass: "text-amber-500",
    emptyTitle: "No Processing Videos",
    emptyDescription: "Videos that are being processed will appear here.",
  },
  ready: {
    icon: CheckCircle,
    label: "Ready",
    badgeClass: "bg-green-200 text-green-900 dark:bg-green-800/50 dark:text-green-100",
    headerIcon: CheckCircle,
    headerIconClass: "text-green-500",
    emptyTitle: "No Videos Ready",
    emptyDescription: "Add videos from Montager or upload directly to see them here.",
  },
  scheduled: {
    icon: Calendar,
    label: "Scheduled",
    badgeClass: "bg-blue-200 text-blue-900 dark:bg-blue-800/50 dark:text-blue-100",
    headerIcon: Calendar,
    headerIconClass: "text-blue-500",
    emptyTitle: "No Scheduled Videos",
    emptyDescription: "Videos waiting to be posted will appear here.",
  },
  published: {
    icon: CheckCircle,
    label: "Published",
    badgeClass: "bg-purple-200 text-purple-900 dark:bg-purple-800/50 dark:text-purple-100",
    headerIcon: Video,
    headerIconClass: "text-purple-500",
    emptyTitle: "No Published Videos",
    emptyDescription: "Videos that have been posted will appear here.",
  },
} as const;

interface VideoGridProps {
  variant: GridVariant;
  // MontagerVideo props (for processing/ready)
  montagerVideos?: MontagerVideo[];
  // AirtableContent props (for scheduled/published)
  airtableVideos?: AirtableContent[];
  isLoading?: boolean;
  selectedDateFilter?: string | null;
  // Ready variant specific props
  campaignId?: string;
  unassignedRecordIds?: string[];
  onVideosAdded?: () => void;
}

// Unified video type for internal use
interface UnifiedVideo {
  id: string;
  videoUrl: string | undefined;
  scheduledDate: string | undefined;
  overlayStyle: string | undefined;
  thumbnailUrl: string | undefined;
  isProcessing: boolean;
}

function normalizeVideo(
  video: MontagerVideo | AirtableContent,
  variant: GridVariant
): UnifiedVideo {
  if (variant === "scheduled" || variant === "published") {
    const v = video as AirtableContent;
    return {
      id: v.id,
      videoUrl: v.video_url,
      scheduledDate: v.date,
      overlayStyle: undefined,
      thumbnailUrl: undefined,
      isProcessing: false,
    };
  }
  const v = video as MontagerVideo;
  return {
    id: v._id,
    videoUrl: v.processedVideoUrl || v.videoUrl,
    scheduledDate: v.scheduledDate,
    overlayStyle: v.overlayStyle,
    thumbnailUrl: v.thumbnailUrl,
    isProcessing: variant === "processing",
  };
}

export function VideoGrid({
  variant,
  montagerVideos = [],
  airtableVideos = [],
  isLoading = false,
  selectedDateFilter = null,
  campaignId,
  unassignedRecordIds = [],
  onVideosAdded,
}: VideoGridProps) {
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const config = VARIANT_CONFIG[variant];
  const isReadyVariant = variant === "ready";
  const availableSlots = unassignedRecordIds.length;

  // Airtable publish action (only for ready variant)
  const publishToAirtable = useAction(api.app.montagerDb.publishVideosToAirtable);

  // Get raw videos based on variant
  const rawVideos = variant === "scheduled" || variant === "published"
    ? airtableVideos
    : montagerVideos;

  // Filter videos by selected date (for montager videos)
  const filteredVideos = useMemo(() => {
    if (variant === "scheduled" || variant === "published") {
      // Airtable videos are pre-filtered by parent
      return rawVideos;
    }
    // Filter montager videos by date
    if (selectedDateFilter === null) return rawVideos;
    if (selectedDateFilter === "unscheduled") {
      return (rawVideos as MontagerVideo[]).filter((v) => !v.scheduledDate);
    }
    return (rawVideos as MontagerVideo[]).filter((v) => v.scheduledDate === selectedDateFilter);
  }, [rawVideos, selectedDateFilter, variant]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDateFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * VIDEOS_PER_PAGE;
    return filteredVideos.slice(start, start + VIDEOS_PER_PAGE);
  }, [filteredVideos, currentPage]);

  // Reset page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Selection hook (only used for ready variant)
  const {
    selectedIds,
    selectedCount,
    hasSelection,
    allSelected,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    clearSelection,
  } = useVideoSelection(isReadyVariant ? (filteredVideos as MontagerVideo[]) : []);

  // Handle publish action (ready variant only)
  const handlePublish = async () => {
    if (!isReadyVariant) return;

    const videosToPublish = hasSelection
      ? (filteredVideos as MontagerVideo[]).filter((v) => selectedIds.has(v._id))
      : (filteredVideos as MontagerVideo[]);

    if (videosToPublish.length === 0) {
      toast.error("No videos to publish");
      return;
    }

    setIsPublishing(true);
    try {
      const result = await publishToAirtable({
        videoIds: videosToPublish.map((v) => v._id),
      });

      if (result.published > 0) {
        toast.success(`Published ${result.published} video${result.published > 1 ? "s" : ""} to Airtable`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} video${result.failed > 1 ? "s" : ""} failed to publish`);
      }
      if (result.skipped > 0) {
        toast.info(`${result.skipped} video${result.skipped > 1 ? "s" : ""} skipped (no Airtable record)`);
      }
      clearSelection();
    } catch (error) {
      console.error("Failed to publish videos:", error);
      toast.error("Failed to publish videos to Airtable");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <>
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          <config.headerIcon className="size-12 mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-semibold mb-1">{config.emptyTitle}</h3>
          <p className="text-sm mb-4">{config.emptyDescription}</p>
          {isReadyVariant && availableSlots > 0 && (
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Plus className="size-4 mr-2" />
              Upload Videos ({availableSlots} slots available)
            </Button>
          )}
        </div>
        {isReadyVariant && campaignId && (
          <BulkUploadDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            campaignId={campaignId}
            unassignedRecordIds={unassignedRecordIds}
            onSuccess={onVideosAdded}
          />
        )}
      </>
    );
  }

  const HeaderIcon = config.headerIcon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isReadyVariant && (
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => {
                if (checked) {
                  selectAll();
                } else {
                  deselectAll();
                }
              }}
              aria-label="Select all videos"
            />
          )}
          <div className="flex items-center gap-2">
            <HeaderIcon className={cn("size-4", config.headerIconClass)} />
            <h3 className="font-medium">
              {config.label} ({filteredVideos.length})
              {selectedDateFilter && (variant === "processing" || variant === "ready") && (
                <span className="text-muted-foreground font-normal">
                  {" "}- {selectedDateFilter === "unscheduled" ? "Unscheduled" : format(parseISO(selectedDateFilter), "MMM d")}
                </span>
              )}
              {isReadyVariant && hasSelection && (
                <span className="text-muted-foreground font-normal">
                  {" "}- {selectedCount} selected
                </span>
              )}
            </h3>
          </div>
        </div>
        {isReadyVariant && (
          <div className="flex items-center gap-2">
            {availableSlots > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Plus className="size-4 mr-2" />
                Upload ({availableSlots})
              </Button>
            )}
            {hasSelection && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setUnassignDialogOpen(true)}
              >
                <Trash2 className="size-4 mr-2" />
                Unassign ({selectedCount})
              </Button>
            )}
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing || filteredVideos.length === 0}
            >
              {isPublishing ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Upload className="size-4 mr-2" />
              )}
              {hasSelection
                ? `Publish Selected (${selectedCount})`
                : `Publish ${filteredVideos.length} to Airtable`}
            </Button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedVideos.map((video) => {
          const normalized = normalizeVideo(video, variant);
          return (
            <VideoCard
              key={normalized.id}
              video={normalized}
              variant={variant}
              isSelected={isReadyVariant ? isSelected(normalized.id as Doc<"montagerVideos">["_id"]) : false}
              onToggleSelect={isReadyVariant ? () => toggleSelection(normalized.id as Doc<"montagerVideos">["_id"]) : undefined}
              showSelection={isReadyVariant}
            />
          );
        })}
      </div>

      {/* Ready variant dialogs */}
      {isReadyVariant && (
        <>
          <UnassignVideosDialog
            open={unassignDialogOpen}
            onOpenChange={setUnassignDialogOpen}
            selectedVideoIds={selectedIds}
            onSuccess={clearSelection}
          />
          {campaignId && (
            <BulkUploadDialog
              open={uploadDialogOpen}
              onOpenChange={setUploadDialogOpen}
              campaignId={campaignId}
              unassignedRecordIds={unassignedRecordIds}
              onSuccess={onVideosAdded}
            />
          )}
        </>
      )}
    </div>
  );
}

interface VideoCardProps {
  video: UnifiedVideo;
  variant: GridVariant;
  isSelected: boolean;
  onToggleSelect?: () => void;
  showSelection: boolean;
}

function VideoCard({
  video,
  variant,
  isSelected,
  onToggleSelect,
  showSelection,
}: VideoCardProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const StatusIcon = config.icon;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-[9/16] rounded-lg overflow-hidden bg-muted border transition-all",
        isSelected && "ring-2 ring-primary border-primary"
      )}
    >
      {/* Selection Checkbox (ready variant only) */}
      {showSelection && onToggleSelect && (
        <div
          className="absolute top-2 left-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect()}
            className="bg-background/80 backdrop-blur-sm"
            aria-label={`Select video ${video.id}`}
          />
        </div>
      )}

      {/* Status Badge */}
      <div className={cn("absolute top-2 z-10", showSelection ? "left-8" : "left-2")}>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className={cn("flex items-center", config.badgeClass)}>
            <StatusIcon className="size-3 mr-1" />
            {config.label}
          </Badge>
          {video.scheduledDate && (
            <Badge
              variant="secondary"
              className="bg-blue-200 text-blue-900 dark:bg-blue-800/50 dark:text-blue-100 text-[10px]"
            >
              {format(parseISO(video.scheduledDate), "MMM d")}
            </Badge>
          )}
        </div>
      </div>

      {/* Overlay Style Badge (top right) */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
        {video.overlayStyle && (
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {video.overlayStyle}
          </Badge>
        )}
      </div>

      {/* Video Content */}
      {isInView ? (
        video.isProcessing ? (
          // Processing state - show thumbnail with overlay
          <div className="absolute inset-0 flex items-center justify-center">
            {video.thumbnailUrl && video.thumbnailUrl !== "manual_upload" && (
              <img
                src={video.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="text-white text-sm font-medium">Processing...</div>
            </div>
          </div>
        ) : video.videoUrl ? (
          // Video player
          <video
            src={video.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            loop
            preload="metadata"
            playsInline
          />
        ) : (
          // No video URL
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="size-8 text-muted-foreground/50" />
          </div>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="size-8 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}
