"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoTableRow } from "./VideoTableRow";
import type { AdvancedVideoMetric } from "../types/advanced-analytics.types";
import { cn } from "@/lib/utils";

interface TopPerformingVideosTableProps {
  videos: AdvancedVideoMetric[];
  selectedVideoId: string | null;
  onVideoSelect: (videoId: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function TopPerformingVideosTable({
  videos,
  selectedVideoId,
  onVideoSelect,
}: TopPerformingVideosTableProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min((currentPage + 1) * ITEMS_PER_PAGE, videos.length);
  const paginatedVideos = videos.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Modern Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">Top Performing Videos</h3>
          <p className="text-sm text-muted-foreground">
            Click any video to view detailed analytics and insights
          </p>
        </div>

        {/* Minimal Pagination Controls */}
        {videos.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground tabular-nums min-w-[140px] text-right">
              {startIndex + 1}–{endIndex} of {videos.length}
            </span>
            <div className="flex items-center gap-0.5 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md"
                disabled={currentPage === 0}
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md"
                disabled={currentPage >= totalPages - 1}
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Table */}
      <div className="flex-1 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="px-6 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Watch Time
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Hook Score
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody className={cn(
              "divide-y divide-border/30",
              paginatedVideos.length === 0 && "divide-y-0"
            )}>
              {paginatedVideos.length > 0 ? (
                paginatedVideos.map((video) => (
                  <VideoTableRow
                    key={video.id}
                    video={video}
                    isSelected={selectedVideoId === video.id}
                    onClick={() => onVideoSelect(video.id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No videos found
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Try selecting different campaigns
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
