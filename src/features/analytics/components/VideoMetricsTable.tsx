"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Eye, Heart, MessageSquare, Share2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { VideoMetric } from "../types/analytics.types";

interface VideoMetricsTableProps {
  videos: VideoMetric[];
  hiddenVideoIds?: string[];
}

const ITEMS_PER_PAGE = 5;

export function VideoMetricsTable({ videos, hiddenVideoIds = [] }: VideoMetricsTableProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Filter out hidden videos
  const visibleVideos = useMemo(() => {
    return videos.filter(v => !hiddenVideoIds.includes(v.videoId));
  }, [videos, hiddenVideoIds]);

  // Sort by views descending
  const sortedVideos = useMemo(() => {
    return [...visibleVideos].sort((a, b) => b.metrics.views - a.metrics.views);
  }, [visibleVideos]);

  // Paginate
  const totalPages = Math.ceil(sortedVideos.length / ITEMS_PER_PAGE);
  const paginatedVideos = sortedVideos.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return 'bg-pink-100 text-pink-700';
      case 'instagram':
        return 'bg-purple-100 text-purple-700';
      case 'youtube':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (sortedVideos.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Videos</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No video data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Top Performing Videos</h3>
        <span className="text-sm text-muted-foreground">
          {sortedVideos.length} videos
        </span>
      </div>

      <ScrollArea className="h-[350px]">
        <div className="space-y-3">
          {paginatedVideos.map((video, index) => (
            <div 
              key={video.videoId}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {currentPage * ITEMS_PER_PAGE + index + 1}
              </div>

              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.campaignName}
                  fill
                  className="object-cover"
                />
                <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium ${getPlatformColor(video.platform)}`}>
                  {video.platform}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{video.campaignName}</p>
                
                {/* Metrics */}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatNumber(video.metrics.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {formatNumber(video.metrics.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {formatNumber(video.metrics.comments)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    {formatNumber(video.metrics.shares)}
                  </span>
                </div>

                {/* Engagement Rate */}
                <div className="mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Engagement</span>
                    <span className="font-medium">
                      {video.metrics.views > 0 
                        ? `${((video.metrics.likes + video.metrics.comments + video.metrics.shares) / video.metrics.views * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* View Link */}
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}