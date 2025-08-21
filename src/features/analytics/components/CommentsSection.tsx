"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  User, 
  Clock, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import type { CommentWithVideo } from "../types/analytics.types";

interface CommentsSectionProps {
  comments: CommentWithVideo[];
  groupedComments: Map<string, CommentWithVideo[]>;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  totalComments: number;
  onRefresh: () => void;
}

export function CommentsSection({
  comments,
  groupedComments,
  isLoading,
  page,
  onPageChange,
  totalPages,
  totalComments,
  onRefresh
}: CommentsSectionProps) {
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

  // Loading state
  if (isLoading && comments.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // No comments state
  if (!isLoading && comments.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20">
              <MessageSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold">Recent Comments</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-4 mb-4">
            <Sparkles className="h-6 w-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium mb-1">No Comments Yet</h4>
          <p className="text-sm text-muted-foreground max-w-sm">
            Comments will appear here once your content receives engagement.
          </p>
        </div>
      </Card>
    );
  }

  // Group comments by video for display
  const videoGroups = Array.from(groupedComments.entries());

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20">
            <MessageSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold">Recent Comments</h3>
          <span className="text-sm text-muted-foreground">
            ({totalComments} total)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Comments List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {videoGroups.map(([videoId, videoComments]) => {
            const firstComment = videoComments[0];
            if (!firstComment) return null;
            
            return (
              <div 
                key={videoId}
                className="bg-muted/30 rounded-lg p-4 space-y-3"
              >
                {/* Video Header */}
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={firstComment.thumbnailUrl}
                      alt={firstComment.campaignName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{firstComment.campaignName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPlatformColor(firstComment.platform)}`}>
                        {firstComment.platform}
                      </span>
                      <a
                        href={firstComment.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        View Post
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {videoComments.length} {videoComments.length === 1 ? 'comment' : 'comments'}
                  </span>
                </div>

                {/* Comments for this video */}
                <div className="space-y-2 pl-4">
                  {videoComments.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
                        {comment.comment.authorProfilePicUrl ? (
                          <Image
                            src={comment.comment.authorProfilePicUrl}
                            alt={comment.comment.authorUsername}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">@{comment.comment.authorUsername}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(comment.comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground break-words">
                          {comment.comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {videoComments.length > 3 && (
                    <button className="text-xs text-primary hover:text-primary/80 pl-11">
                      View {videoComments.length - 3} more {videoComments.length - 3 === 1 ? 'comment' : 'comments'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}