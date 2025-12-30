"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, AlertCircle, FolderOpen } from "lucide-react";

interface VideoCategoryCardProps {
  category: string;
  totalCount: number;
  neededCount: number;
  processingCount: number;
  readyCount: number;
  scheduledCount: number;
  publishedCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function VideoCategoryCard({
  category,
  totalCount,
  neededCount,
  processingCount,
  readyCount,
  scheduledCount,
  publishedCount,
  isSelected,
  onClick,
}: VideoCategoryCardProps) {
  const completedCount = scheduledCount + publishedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine status color
  const getStatusColor = () => {
    if (neededCount > 0) return "text-red-500";
    if (processingCount > 0) return "text-amber-500";
    if (readyCount > 0) return "text-green-500";
    return "text-blue-500";
  };

  const getStatusBadge = () => {
    if (neededCount > 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          {neededCount} needed
        </Badge>
      );
    }
    if (processingCount > 0) {
      return (
        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          {processingCount} processing
        </Badge>
      );
    }
    if (readyCount > 0) {
      return (
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {readyCount} ready
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        Up to date
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md",
        !isSelected && "hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderOpen className={cn("size-5", getStatusColor())} />
            <h3 className="font-semibold text-sm">{category}</h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedCount} / {totalCount} complete</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {neededCount > 0 && (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <AlertCircle className="size-3.5" />
              <span>{neededCount} needed</span>
            </div>
          )}
          {processingCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
              <span>{processingCount} processing</span>
            </div>
          )}
          {readyCount > 0 && (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <CheckCircle className="size-3.5" />
              <span>{readyCount} ready</span>
            </div>
          )}
          {(scheduledCount > 0 || publishedCount > 0) && (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <CheckCircle className="size-3.5" />
              <span>{scheduledCount + publishedCount} done</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
