"use client";

import { Film, Sparkles, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ClipperClip } from "../../shared/types/common.types";
import { formatDistanceToNow } from "date-fns";

interface ClipCardProps {
  clip: ClipperClip;
  isSelected: boolean;
  onToggleSelection: () => void;
}

export function ClipCard({
  clip,
  isSelected,
  onToggleSelection,
}: ClipCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getQualityLabel = (value: number, type: 'clarity' | 'brightness') => {
    if (type === 'clarity') {
      if (value >= 400) return { label: 'Excellent', color: 'text-green-600' };
      if (value >= 300) return { label: 'Good', color: 'text-blue-600' };
      if (value >= 200) return { label: 'Fair', color: 'text-yellow-600' };
      return { label: 'Poor', color: 'text-red-600' };
    } else {
      if (value >= 180) return { label: 'Bright', color: 'text-green-600' };
      if (value >= 120) return { label: 'Good', color: 'text-blue-600' };
      if (value >= 80) return { label: 'Dim', color: 'text-yellow-600' };
      return { label: 'Dark', color: 'text-red-600' };
    }
  };

  const clarityQuality = getQualityLabel(clip.clarity, 'clarity');
  const brightnessQuality = getQualityLabel(clip.brightness, 'brightness');

  return (
    <Card
      className={cn(
        "group relative transition-all hover:shadow-lg hover:bg-muted/50 cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={(e) => {
        // Don't toggle if clicking on checkbox
        if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
          return;
        }
        onToggleSelection();
      }}
    >
      <CardContent className="p-6">
        {/* Checkbox */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            className="size-6 sm:size-5 bg-white shadow-md"
          />
        </div>

        {/* Video Placeholder */}
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
          <Film className="size-12 text-muted-foreground/30" />
        </div>

        {/* Filename */}
        <h3 className="font-medium text-sm sm:text-base truncate mb-3" title={clip.filename}>
          {clip.filename}
        </h3>

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 sm:size-3" />
              <span className="text-muted-foreground">Clarity:</span>
            </div>
            <span className={cn("font-semibold", clarityQuality.color)}>
              {clarityQuality.label}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Sun className="size-4 sm:size-3" />
              <span className="text-muted-foreground">Brightness:</span>
            </div>
            <span className={cn("font-semibold", brightnessQuality.color)}>
              {brightnessQuality.label}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <span>{formatFileSize(clip.size)}</span>
            {clip.lastModified > 0 && (
              <span>
                {formatDistanceToNow(clip.lastModified, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
