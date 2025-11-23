"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Heart, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface VideoMetric {
  postId: string;
  videoId: string;
  videoUrl: string;
  mediaUrl?: string;
  postedAt: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

interface VideoPerformanceTableProps {
  videoMetrics: VideoMetric[];
}

const ITEMS_PER_PAGE = 5;

export function VideoPerformanceTable({ videoMetrics }: VideoPerformanceTableProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(videoMetrics.length / ITEMS_PER_PAGE);

  const paginatedVideos = videoMetrics.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <Card className="p-6 border border-primary/10">
      <div className="mb-6 space-y-2">
        <h3 className="text-lg font-semibold">Content Performance</h3>
        <p className="text-sm text-muted-foreground">Top 100 videos by highest views</p>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {videoMetrics.length > 0 ? (
            `Showing ${Math.min(currentPage * ITEMS_PER_PAGE + 1, videoMetrics.length)} - ${Math.min((currentPage + 1) * ITEMS_PER_PAGE, videoMetrics.length)} of ${videoMetrics.length} videos`
          ) : (
            "No videos found"
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="overflow-auto space-y-4">
        {paginatedVideos.length > 0 ? (
          paginatedVideos.map((video) => (
            <div
              key={video.postId}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              {video.mediaUrl && (
                <div className="relative h-16 aspect-[9/16] rounded overflow-hidden bg-muted">
                  <video src={video.mediaUrl} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">Video {video.videoId}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(video.postedAt * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open on TikTok
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{video.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{video.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{video.shares.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{video.comments.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No videos found for this campaign</p>
          </div>
        )}
      </div>
    </Card>
  );
}
