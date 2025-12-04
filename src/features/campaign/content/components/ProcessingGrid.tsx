"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../../../convex/_generated/dataModel";

const VIDEOS_PER_PAGE = 8;

type MontagerVideo = Doc<"montagerVideos">;

interface ProcessingGridProps {
  processingVideos: MontagerVideo[];
  isLoading: boolean;
  selectedDateFilter?: string | null;
}

export function ProcessingGrid({
  processingVideos,
  isLoading,
  selectedDateFilter = null,
}: ProcessingGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter videos by selected date
  const filteredVideos = useMemo(() => {
    if (selectedDateFilter === null) return processingVideos;
    if (selectedDateFilter === "unscheduled") {
      return processingVideos.filter((v) => !v.scheduledDate);
    }
    return processingVideos.filter((v) => v.scheduledDate === selectedDateFilter);
  }, [processingVideos, selectedDateFilter]);

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
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Clock className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Processing Videos</h3>
        <p className="text-sm">
          Videos that are being processed will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-amber-500" />
          <h3 className="font-medium">
            Processing ({filteredVideos.length})
            {selectedDateFilter && (
              <span className="text-muted-foreground font-normal">
                {" "}- {selectedDateFilter === "unscheduled" ? "Unscheduled" : format(parseISO(selectedDateFilter), "MMM d")}
              </span>
            )}
          </h3>
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
          <ProcessingVideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}

interface ProcessingVideoCardProps {
  video: MontagerVideo;
}

function ProcessingVideoCard({ video }: ProcessingVideoCardProps) {
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

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-muted border"
    >
      {/* Status Badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <Clock className="size-3 mr-1" />
          Processing
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
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="size-8 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}
