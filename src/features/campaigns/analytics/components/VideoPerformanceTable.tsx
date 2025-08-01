import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Heart, MessageCircle, Share2, ExternalLink } from "lucide-react";
import type { AnalyticsData } from "../types/analytics.types";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface VideoPerformanceTableProps {
  generatedVideos: Doc<"videos">[] | undefined;
  videoMetrics: AnalyticsData['videoMetrics'];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function VideoPerformanceTable({
  generatedVideos,
  videoMetrics,
  currentPage,
  itemsPerPage,
  onPageChange,
}: VideoPerformanceTableProps) {
  if (!generatedVideos) {
    return null;
  }

  const totalPages = Math.ceil(generatedVideos.length / itemsPerPage);

  // Map videos with their analytics data and sort by views
  const videosWithMetrics = generatedVideos
    .map((video) => {
      const videoMetric = videoMetrics.find((m: any) => 
        m.id === (video.tiktokUpload?.post?.id || video.instagramUpload?.post?.id || video.youtubeUpload?.post?.id)
      ) || {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0
      };
      return {
        ...video,
        views: videoMetric.views,
        likes: videoMetric.likes,
        comments: videoMetric.comments,
        shares: videoMetric.shares
      };
    })
    .sort((a, b) => b.views - a.views);

  const paginatedVideos = videosWithMetrics.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  return (
    <Card className="p-6 border border-primary/10">
      <div className="mb-6 space-y-2">
        <h3 className="text-lg font-semibold">Content Performance</h3>
        <p className="text-sm text-muted-foreground">All videos sorted by highest views</p>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {generatedVideos.length > 0 ? (
            `Showing ${Math.min(currentPage * itemsPerPage + 1, generatedVideos.length)} - ${Math.min((currentPage + 1) * itemsPerPage, generatedVideos.length)} of ${generatedVideos.length} videos`
          ) : (
            "No videos found"
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="overflow-auto space-y-4">
        {paginatedVideos.length > 0 ? (
          paginatedVideos.map((video) => (
            <div
              key={video._id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="relative h-16 aspect-[9/16] rounded overflow-hidden bg-muted">
                <video src={video.video.url} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{video.video.name}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {video.video.type} • Posted {new Date(video._creationTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  {video.tiktokUpload?.post?.url && (
                    <a
                      href={video.tiktokUpload.post.url}
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