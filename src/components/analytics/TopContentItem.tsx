import { ExternalLink, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import type { VideoMetric } from "@/types/analytics.types";

export { type VideoMetric };


interface TopContentItemProps {
    video: VideoMetric;
    rank: number;
}

export function TopContentItem({ video, rank }: TopContentItemProps) {
    return (
        <div
            key={video.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
        >
            <div className="flex gap-3 flex-1 min-w-0">
                <div className="relative h-16 sm:h-16 md:h-20 aspect-[9/16] rounded overflow-hidden bg-muted shrink-0">
                    {/* Use thumbnailUrl for the preview image */}
                    <video
                        src={video.videoInfo.videoUrl}
                        className="h-full w-full object-cover"
                    />
                    {/* <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Badge variant="secondary" className="bg-background/70">
                            {rank}ß
                        </Badge>
                    </div> */}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm md:text-base font-medium truncate">{video.videoInfo.campaign.campaignName}</h4>
                    <div className="flex items-center gap-2">
                        <p className="text-[11px] md:text-xs text-muted-foreground">
                            Posted {(() => {
                                const timestamp = typeof video.videoInfo.createdAt === 'number'
                                    ? video.videoInfo.createdAt
                                    : new Date(video.videoInfo.createdAt).getTime();
                                // Check if timestamp is in seconds (less than 10 billion) vs milliseconds
                                const date = timestamp < 10000000000
                                    ? new Date(timestamp * 1000)
                                    : new Date(timestamp);
                                return date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            })()}
                        </p>
                    </div>
                    {video.videoInfo.tiktokUrl && (
                        <a
                            href={video.videoInfo.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] md:text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                            <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            <span className="hidden sm:inline">Open on TikTok</span>
                            <span className="sm:hidden">TikTok</span>
                        </a>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs md:text-sm overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
                <div className="flex items-center gap-1 shrink-0">
                    <Eye className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
                    <span>{video.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Heart className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
                    <span>{video.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Share2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
                    <span>{video.shares.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <MessageCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
                    <span>{video.comments.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
