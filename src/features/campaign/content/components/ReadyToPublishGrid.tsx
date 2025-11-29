"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, Upload, Video, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useVideoSelection } from "../hooks/useVideoSelection";
import { UnassignVideosDialog } from "../dialogs/UnassignVideosDialog";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type MontagerVideo = Doc<"montagerVideos">;

interface ReadyToPublishGridProps {
  processingVideos: MontagerVideo[];
  processedVideos: MontagerVideo[];
  isLoading: boolean;
}

export function ReadyToPublishGrid({
  processingVideos,
  processedVideos,
  isLoading,
}: ReadyToPublishGridProps) {
  const totalCount = processingVideos.length + processedVideos.length;
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);

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
  } = useVideoSelection(processedVideos);

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

  if (totalCount === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Video className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Videos Ready</h3>
        <p className="text-sm">
          Add videos from Montager to see them here for processing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Ready to Publish Section (at top) */}
      {processedVideos.length > 0 && (
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
                  Ready to Publish ({processedVideos.length})
                  {hasSelection && (
                    <span className="text-muted-foreground font-normal">
                      {" "}- {selectedCount} selected
                    </span>
                  )}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                onClick={() => {
                  toast.info("Publish to Airtable feature coming soon!");
                }}
              >
                <Upload className="size-4 mr-2" />
                Publish All to Airtable
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedVideos.map((video) => (
              <ReadyToPublishVideoCard
                key={video._id}
                video={video}
                status="processed"
                selectable
                isSelected={isSelected(video._id)}
                onToggleSelect={() => toggleSelection(video._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unassign Confirmation Dialog */}
      <UnassignVideosDialog
        open={unassignDialogOpen}
        onOpenChange={setUnassignDialogOpen}
        selectedVideoIds={selectedIds}
        onSuccess={clearSelection}
      />

      {/* Processing Section (at bottom) */}
      {processingVideos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-amber-500" />
            <h3 className="font-medium">Processing ({processingVideos.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processingVideos.map((video) => (
              <ReadyToPublishVideoCard
                key={video._id}
                video={video}
                status="processing"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ReadyToPublishVideoCardProps {
  video: MontagerVideo;
  status: "processing" | "processed";
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

function ReadyToPublishVideoCard({
  video,
  status,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}: ReadyToPublishVideoCardProps) {
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

  const videoUrl = status === "processed" && video.processedVideoUrl
    ? video.processedVideoUrl
    : video.videoUrl;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-[9/16] rounded-lg overflow-hidden bg-muted border transition-all",
        isSelected && "ring-2 ring-primary border-primary"
      )}
    >
      {/* Selection Checkbox */}
      {selectable && (
        <div
          className="absolute top-2 left-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.()}
            className="bg-background/80 backdrop-blur-sm"
            aria-label={`Select video ${video._id}`}
          />
        </div>
      )}

      {/* Status Badge */}
      <div className={cn("absolute top-2 z-10", selectable ? "left-8" : "left-2")}>
        {status === "processing" ? (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <Clock className="size-3 mr-1" />
            Processing
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
            <CheckCircle className="size-3 mr-1" />
            Ready
          </Badge>
        )}
      </div>

      {/* Overlay Style Badge */}
      {video.overlayStyle && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {video.overlayStyle}
          </Badge>
        </div>
      )}

      {/* Video Content */}
      {isInView ? (
        status === "processing" ? (
          // Show thumbnail for processing videos
          <div className="absolute inset-0 flex items-center justify-center">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover opacity-50"
              />
            ) : (
              <div className="text-muted-foreground">
                <Clock className="size-8 animate-pulse" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="text-white text-sm font-medium">Processing...</div>
            </div>
          </div>
        ) : (
          // Show video for processed videos
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            loop
            preload="metadata"
            playsInline
          />
        )
      ) : (
        // Placeholder while not in view
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="size-8 text-muted-foreground/50" />
        </div>
      )}

    </div>
  );
}
