"use client";

import { MessageSquare, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ScrapeStatusBadgeProps {
  totalComments: number;
  selectedCount: number;
  lastScrapedAt: number | null;
  isActive: boolean;
  progressPercent: number;
  className?: string;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function ScrapeStatusBadge({
  totalComments,
  selectedCount,
  lastScrapedAt,
  isActive,
  progressPercent,
  className,
}: ScrapeStatusBadgeProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Active scraping progress */}
      {isActive && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Scraping comments...</span>
          </div>
          <div className="flex-1 max-w-32">
            <Progress value={progressPercent} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground">{progressPercent}%</span>
        </div>
      )}

      {/* Stats badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {totalComments.toLocaleString()} comments
        </Badge>

        {selectedCount > 0 && (
          <Badge variant="default" className="gap-1.5">
            {selectedCount.toLocaleString()} selected
          </Badge>
        )}

        {lastScrapedAt && !isActive && (
          <Badge variant="outline" className="gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Last scraped {formatRelativeTime(lastScrapedAt)}
          </Badge>
        )}
      </div>
    </div>
  );
}
