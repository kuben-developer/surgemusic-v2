"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useAction } from "convex/react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Upload, Video, Trash2, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useVideoSelection } from "../hooks/useVideoSelection";
import { UnassignVideosDialog } from "../dialogs/UnassignVideosDialog";
import { BulkUploadDialog } from "../dialogs/BulkUploadDialog";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";

const VIDEOS_PER_PAGE = 8;

type MontagerVideo = Doc<"montagerVideos">;

interface ReadyToPublishGridProps {
  processedVideos: MontagerVideo[];
  isLoading: boolean;
  campaignId: string;
  unassignedRecordIds: string[];
  onVideosAdded?: () => void;
  selectedDateFilter?: string | null;
}

export function ReadyToPublishGrid({
  processedVideos,
  isLoading,
  campaignId,
  unassignedRecordIds,
  onVideosAdded,
  selectedDateFilter = null,
}: ReadyToPublishGridProps) {
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const availableSlots = unassignedRecordIds.length;

  // Airtable publish action
  const publishToAirtable = useAction(api.app.montagerDb.publishVideosToAirtable);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Filter videos by selected date
  const filteredVideos = useMemo(() => {
    if (selectedDateFilter === null) return processedVideos;
    if (selectedDateFilter === "unscheduled") {
      return processedVideos.filter((v) => !v.scheduledDate);
    }
    return processedVideos.filter((v) => v.scheduledDate === selectedDateFilter);
  }, [processedVideos, selectedDateFilter]);

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
  } = useVideoSelection(filteredVideos);

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
          <Video className="size-12 mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-semibold mb-1">No Videos Ready</h3>
          <p className="text-sm mb-4">
            Add videos from Montager or upload directly to see them here.
          </p>
          {availableSlots > 0 && (
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Plus className="size-4 mr-2" />
              Upload Videos ({availableSlots} slots available)
            </Button>
          )}
        </div>
        <BulkUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          campaignId={campaignId}
          unassignedRecordIds={unassignedRecordIds}
          onSuccess={onVideosAdded}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-green-500" />
            <h3 className="font-medium">
              Ready to Publish ({filteredVideos.length})
              {selectedDateFilter && (
                <span className="text-muted-foreground font-normal">
                  {" "}- {selectedDateFilter === "unscheduled" ? "Unscheduled" : format(parseISO(selectedDateFilter), "MMM d")}
                </span>
              )}
              {hasSelection && (
                <span className="text-muted-foreground font-normal">
                  {" "}- {selectedCount} selected
                </span>
              )}
            </h3>
          </div>
        </div>
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
            onClick={async () => {
              const videosToPublish = hasSelection
                ? filteredVideos.filter((v) => selectedIds.has(v._id))
                : filteredVideos;

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
            }}
            disabled={isPublishing || filteredVideos.length === 0}
          >
            {isPublishing ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Upload className="size-4 mr-2" />
            )}
            {hasSelection
              ? `Publish Selected (${selectedCount})`
              : "Publish All to Airtable"}
          </Button>
        </div>
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
        {paginatedVideos.map((video) => (
          <ReadyVideoCard
            key={video._id}
            video={video}
            isSelected={isSelected(video._id)}
            onToggleSelect={() => toggleSelection(video._id)}
          />
        ))}
      </div>

      {/* Unassign Confirmation Dialog */}
      <UnassignVideosDialog
        open={unassignDialogOpen}
        onOpenChange={setUnassignDialogOpen}
        selectedVideoIds={selectedIds}
        onSuccess={clearSelection}
      />

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        campaignId={campaignId}
        unassignedRecordIds={unassignedRecordIds}
        onSuccess={onVideosAdded}
      />
    </div>
  );
}

interface ReadyVideoCardProps {
  video: MontagerVideo;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function ReadyVideoCard({
  video,
  isSelected,
  onToggleSelect,
}: ReadyVideoCardProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const videoUrl = video.processedVideoUrl || video.videoUrl;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-[9/16] rounded-lg overflow-hidden bg-muted border transition-all",
        isSelected && "ring-2 ring-primary border-primary"
      )}
    >
      {/* Selection Checkbox */}
      <div
        className="absolute top-2 left-2 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect()}
          className="bg-background/80 backdrop-blur-sm"
          aria-label={`Select video ${video._id}`}
        />
      </div>

      {/* Status Badge */}
      <div className="absolute top-2 left-8 z-10">
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
          <CheckCircle className="size-3 mr-1" />
          Ready
        </Badge>
      </div>

      {/* Overlay Style & Scheduled Date Badges */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
        {video.overlayStyle && (
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {video.overlayStyle}
          </Badge>
        )}
        {video.scheduledDate && (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 text-[10px]"
          >
            {format(parseISO(video.scheduledDate), "MMM d")}
          </Badge>
        )}
      </div>

      {/* Video Content */}
      {isInView ? (
        <video
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          controls
          loop
          preload="metadata"
          playsInline
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="size-8 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}
