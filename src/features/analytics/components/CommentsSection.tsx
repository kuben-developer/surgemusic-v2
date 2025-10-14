"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  User,
  Clock,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Video,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CommentWithVideo } from "../types/analytics.types";

// Generate consistent random color based on string
const getColorFromString = (str: string): { bg: string; icon: string; border: string } => {
  const colors = [
    { bg: "from-blue-500/10 via-indigo-500/5 to-transparent", icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20" },
    { bg: "from-purple-500/10 via-pink-500/5 to-transparent", icon: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
    { bg: "from-green-500/10 via-emerald-500/5 to-transparent", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
    { bg: "from-orange-500/10 via-red-500/5 to-transparent", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20" },
    { bg: "from-cyan-500/10 via-blue-500/5 to-transparent", icon: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/20" },
    { bg: "from-pink-500/10 via-rose-500/5 to-transparent", icon: "text-pink-600 dark:text-pink-400", border: "border-pink-500/20" },
    { bg: "from-violet-500/10 via-purple-500/5 to-transparent", icon: "text-violet-600 dark:text-violet-400", border: "border-violet-500/20" },
    { bg: "from-amber-500/10 via-yellow-500/5 to-transparent", icon: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length]!;
};

interface CommentsSectionProps {
  comments: CommentWithVideo[];
  groupedComments: Map<string, CommentWithVideo[]>;
  isLoading: boolean;
  error?: Error | null;
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
  error,
  page,
  onPageChange,
  totalPages,
  totalComments,
  onRefresh
}: CommentsSectionProps) {
  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400';
      case 'instagram':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400';
      case 'youtube':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Loading state
  if (isLoading && comments.length === 0) {
    return (
      <Card className="p-4 md:p-6 border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Skeleton className="h-8 w-8 md:h-9 md:w-9 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
              <Skeleton className="h-3 w-20 md:w-24 hidden sm:block" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 md:h-9 md:w-9 rounded-lg" />
        </div>
        <div className="space-y-3 md:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-3 md:p-4 space-y-2 md:space-y-3 border border-border/50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Skeleton className="h-4 w-24 md:w-32" />
                  <Skeleton className="h-5 w-14 md:w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-12 md:w-20" />
              </div>
              <div className="space-y-2 md:space-y-3 pl-1">
                <div className="flex gap-2 md:gap-3">
                  <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16 md:w-20" />
                      <Skeleton className="h-3 w-12 md:w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <Card className="p-4 md:p-6 border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent border border-red-500/20">
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold">Recent Comments</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">Stay connected with your audience</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 md:h-9 md:w-9 p-0"
          >
            <RefreshCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>

        <div className="py-8 md:py-16 flex flex-col items-center justify-center text-center px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-2xl rounded-full" />
            <div className="relative rounded-full bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 p-4 md:p-5 border border-red-200/50 dark:border-red-800/50 mb-4 md:mb-6">
              <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <h4 className="text-sm md:text-base font-semibold mb-2">Failed to Load Comments</h4>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md mb-4">
            {error.message || "An error occurred while loading comments. Please try again."}
          </p>
          <Button variant="outline" onClick={onRefresh} size="sm">
            <RefreshCcw className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // No comments state
  if (!isLoading && comments.length === 0) {
    return (
      <Card className="p-4 md:p-6 border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-transparent border border-violet-500/20">
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold">Recent Comments</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">Stay connected with your audience</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 md:h-9 md:w-9 p-0"
          >
            <RefreshCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>

        <div className="py-8 md:py-16 flex flex-col items-center justify-center text-center px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-pink-500/20 blur-2xl rounded-full" />
            <div className="relative rounded-full bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/50 dark:to-pink-950/50 p-4 md:p-5 border border-violet-200/50 dark:border-violet-800/50 mb-4 md:mb-6">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-violet-500 dark:text-violet-400" />
            </div>
          </div>
          <h4 className="text-sm md:text-base font-semibold mb-2">No Comments Yet</h4>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md">
            Your audience engagement will appear here. Comments help you understand what resonates with your viewers.
          </p>
        </div>
      </Card>
    );
  }

  // Group comments by video for display
  const videoGroups = Array.from(groupedComments.entries());

  return (
    <Card className="p-4 md:p-6 border-border/50 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-transparent border border-violet-500/20">
            <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold">Recent Comments</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'} across all campaigns
            </p>
            <p className="text-xs text-muted-foreground sm:hidden">
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-muted/50 shrink-0"
        >
          <RefreshCcw className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
          {videoGroups.map(([videoId, videoComments]) => {
            const firstComment = videoComments[0];
            if (!firstComment) return null;

            const platformBadge = getPlatformBadge(firstComment.platform);

            return (
              <div
                key={videoId}
                className="group bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-3 md:p-4 space-y-2 md:space-y-3 border border-border/50 hover:border-border transition-all duration-200"
              >
                {/* Video Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                      <Video className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground shrink-0" />
                      <p className="text-xs md:text-sm font-medium truncate">
                        {firstComment.campaignName}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`${platformBadge} text-[10px] md:text-xs px-1.5 md:px-2 py-0 h-4 md:h-5`}
                      >
                        {firstComment.platform}
                      </Badge>
                    </div>
                    <a
                      href={firstComment.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 md:gap-1.5 text-[11px] md:text-xs text-primary hover:text-primary/80 transition-colors group/link"
                    >
                      <span>View Post</span>
                      <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 h-fit">
                    {videoComments.length}
                  </Badge>
                </div>

                {/* Comments for this video */}
                <div className="space-y-1.5 md:space-y-2 pl-0 md:pl-1">
                  {videoComments.slice(0, 3).map((comment) => {
                    const userColors = getColorFromString(comment.comment.authorUsername);
                    return (
                      <div
                        key={comment.id}
                        className="flex gap-2 md:gap-3 p-1.5 md:p-2 rounded-lg hover:bg-background/50 transition-colors duration-150"
                      >
                        <div className={`h-7 w-7 md:h-9 md:w-9 rounded-full bg-gradient-to-br ${userColors.bg} border ${userColors.border} flex items-center justify-center shrink-0`}>
                          <User className={`h-3 w-3 md:h-4 md:w-4 ${userColors.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            <span className="text-[11px] md:text-xs font-semibold truncate">@{comment.comment.authorUsername}</span>
                            <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-0.5 md:gap-1 shrink-0">
                              <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              <span className="hidden sm:inline">{formatDistanceToNow(new Date(comment.comment.createdAt * 1000), { addSuffix: true })}</span>
                              <span className="sm:hidden">{formatDistanceToNow(new Date(comment.comment.createdAt * 1000), { addSuffix: true }).replace('about ', '')}</span>
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-foreground/80 break-words leading-relaxed">
                            {comment.comment.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {videoComments.length > 3 && (
                    <button className="text-[11px] md:text-xs font-medium text-primary hover:text-primary/80 pl-9 md:pl-12 py-1 hover:underline transition-colors">
                      + {videoComments.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 md:mt-5 pt-4 md:pt-5 border-t border-border/50">
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-[11px] md:text-xs font-medium text-foreground">Page {page + 1}</span>
            <span className="text-[11px] md:text-xs text-muted-foreground">of {totalPages}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8 border-border/50 hover:border-border hover:bg-muted/50"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8 border-border/50 hover:border-border hover:bg-muted/50"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}