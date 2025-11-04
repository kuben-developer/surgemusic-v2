"use client";

import { ArrowLeft, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VideoStatsHeaderProps {
  category: string;
  withUrlCount: number;
  totalCount: number;
  onBack: () => void;
}

function getProgressColor(withUrl: number, total: number): string {
  if (total === 0) return "text-muted-foreground";
  const percentage = (withUrl / total) * 100;

  if (percentage >= 100) return "text-green-600 dark:text-green-500";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-500";
  return "text-red-600 dark:text-red-500";
}

export function VideoStatsHeader({
  category,
  withUrlCount,
  totalCount,
  onBack,
}: VideoStatsHeaderProps) {
  const percentage = totalCount > 0 ? Math.round((withUrlCount / totalCount) * 100) : 0;

  return (
    <div className="flex items-center justify-between pb-6 border-b">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">{category}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Video content for this category
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Video className="size-5 text-primary" />
          <span
            className={cn(
              "text-3xl font-bold font-mono",
              getProgressColor(withUrlCount, totalCount)
            )}
          >
            {withUrlCount}/{totalCount}
          </span>
        </div>
        <Badge
          variant={percentage >= 80 ? "default" : percentage >= 50 ? "secondary" : "outline"}
          className="text-sm px-3 py-1"
        >
          {percentage}%
        </Badge>
      </div>
    </div>
  );
}
