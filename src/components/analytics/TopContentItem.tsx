import { ExternalLink, Eye, Heart, MessageCircle, Share2 } from "lucide-react";

// Assuming VideoMetric type is defined elsewhere or passed/imported
// For now, using 'any' as a placeholder if the type isn't easily importable
// Ideally, define or import the actual VideoMetric type
interface VideoMetric {
    id: string;
    videoInfo: {
        id: string;
        postId: string | null;
        videoUrl: string;
        videoName: string;
        videoType: string;
        tiktokUrl: string;
        createdAt: Date;
        campaign: {
            id: number;
            campaignName: string;
        };
    };
    views: number;
    likes: number;
    comments: number; // Add if needed later
    shares: number; // Add if needed later
    engagementRate: string;
}


interface TopContentItemProps {
    video: VideoMetric;
    rank: number;
}

export function TopContentItem({ video, rank }: TopContentItemProps) {
    return (
        <div
            key={video.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
        >
            <div className="relative h-16 aspect-[9/16] rounded overflow-hidden bg-muted">
                {/* Consider adding error handling or a placeholder for video loading */}
                <video src={video.videoInfo.videoUrl} className="h-full w-full object-cover" />
                {/* <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Badge variant="secondary" className="bg-background/70">
                        {rank}
                    </Badge>
                </div> */}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{video.videoInfo.videoName}</h4>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                        {video.videoInfo.videoType} • Posted {new Date(video.videoInfo.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                </div>
                {video.videoInfo.tiktokUrl && (
                    <a
                        href={video.videoInfo.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        <ExternalLink className="h-3 w-3" />
                        Open on TikTok
                    </a>
                )}
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
    );
}

// Re-export the type if needed by parent components
export type { VideoMetric }; 