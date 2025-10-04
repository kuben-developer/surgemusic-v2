"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Hash, Eye, TrendingUp, Target, Clock, Globe } from "lucide-react";
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
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Top Performing Videos
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            Click any video to view detailed analytics and insights
          </p>
        </div>

        {/* Enhanced Pagination Controls */}
        {videos.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-sm font-medium text-foreground tabular-nums">
                {startIndex + 1}–{endIndex}
              </span>
              <span className="text-sm text-muted-foreground mx-1.5">of</span>
              <span className="text-sm font-semibold text-primary tabular-nums">
                {videos.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg transition-all hover:scale-105"
                disabled={currentPage === 0}
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg transition-all hover:scale-105"
                disabled={currentPage >= totalPages - 1}
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Table */}
      <div className="flex-1 rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/5">
        <div className="overflow-auto h-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3" />
                    <span>Video</span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground tracking-wider">
                  <div className="flex items-center justify-center gap-1.5">
                    <Eye className="h-3 w-3" />
                    <span>Views</span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground tracking-wider">
                  <div className="flex items-center justify-center gap-1.5">
                    <TrendingUp className="h-3 w-3" />
                    <span>Eng Rate</span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground tracking-wider">
                  <div className="flex items-center justify-center gap-1.5">
                    <Target className="h-3 w-3" />
                    <span>Hook Score</span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground tracking-wider">
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>Watch Time</span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground tracking-wider">
                  <div className="flex items-center justify-end gap-1.5">
                    <Globe className="h-3 w-3" />
                    <span>Top Country</span>
                  </div>
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
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-primary/70"
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
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-foreground">
                          No videos found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try selecting different campaigns or date ranges
                        </p>
                      </div>
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
