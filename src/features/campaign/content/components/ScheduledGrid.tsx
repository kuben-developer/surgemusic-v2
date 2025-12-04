"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { AirtableContent } from "../../shared/types/campaign.types";

const VIDEOS_PER_PAGE = 8;

interface ScheduledGridProps {
  videos: AirtableContent[];
}

export function ScheduledGrid({ videos }: ScheduledGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * VIDEOS_PER_PAGE;
    return videos.slice(start, start + VIDEOS_PER_PAGE);
  }, [videos, currentPage]);

  // Reset page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Calendar className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Scheduled Videos</h3>
        <p className="text-sm">
          Videos waiting to be posted will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-blue-500" />
          <h3 className="font-medium">Scheduled ({videos.length})</h3>
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
          <ScheduledVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

interface ScheduledVideoCardProps {
  video: AirtableContent;
}

function ScheduledVideoCard({ video }: ScheduledVideoCardProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = containerRef.current;

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

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!video.video_url) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="group relative bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-blue-500/20 overflow-hidden transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5"
    >
      <div className="aspect-[9/16] bg-muted/30 relative overflow-hidden">
        {isInView ? (
          <video
            src={video.video_url}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            controls
            loop
            preload="metadata"
            style={{
              aspectRatio: "9 / 16",
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Scheduled Badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-500/30"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="font-medium">Scheduled</span>
        </Badge>

        {/* Account Niche Badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 gap-2 px-3 py-1.5 bg-background/50 backdrop-blur-md border-primary/20"
        >
          <Tag className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium">{video.account_niche}</span>
        </Badge>
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground truncate">
          {video.video_category}
        </div>
        {video.date && (
          <Badge variant="outline" className="text-xs">
            {video.date}
          </Badge>
        )}
      </div>
    </div>
  );
}
