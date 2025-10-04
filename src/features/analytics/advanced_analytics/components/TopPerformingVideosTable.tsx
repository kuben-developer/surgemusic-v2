"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoTableRow } from "./VideoTableRow";
import type { AdvancedVideoMetric } from "../types/advanced-analytics.types";

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
    <Card className="p-6 border border-primary/10">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Top Performing Videos</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click on a video to view detailed analytics
        </p>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {videos.length > 0
            ? `Showing ${startIndex + 1} - ${endIndex} of ${videos.length} videos`
            : "No videos found"}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={handlePrevious}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left text-sm font-medium">Video</th>
              <th className="p-4 text-right text-sm font-medium">Views</th>
              <th className="p-4 text-right text-sm font-medium">Avg Watch Time</th>
              <th className="p-4 text-right text-sm font-medium">Hook Score</th>
              <th className="p-4 text-right text-sm font-medium">Engagement Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
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
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No videos found for the selected campaigns
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
