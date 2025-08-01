"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { CalendarX, CheckCircle2, AlertCircle, Instagram, Youtube, Music2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ScheduledVideo, UnscheduleResult } from "../types/unschedule.types";

interface UnscheduleVideoItemProps {
  video: ScheduledVideo;
  isSelected: boolean;
  isUnscheduling: boolean;
  result?: UnscheduleResult;
  onToggleSelection: (postId: string) => void;
}

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'youtube':
      return <Youtube className="h-4 w-4" />;
    case 'tiktok':
      return <Music2 className="h-4 w-4" />;
    default:
      return null;
  }
}

export function UnscheduleVideoItem({
  video,
  isSelected,
  isUnscheduling,
  result,
  onToggleSelection
}: UnscheduleVideoItemProps) {
  return (
    <div
      className={cn(
        "flex items-start space-x-3 rounded-lg border p-3 transition-colors",
        isSelected && "bg-muted/50",
        result?.success && "border-green-500/50 bg-green-500/10",
        result?.success === false && "border-red-500/50 bg-red-500/10"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelection(video.postId)}
        disabled={isUnscheduling || result !== undefined}
        className="mt-1"
      />
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{video.videoName}</h4>
          {result?.success && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {result?.success === false && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {video.postCaption}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarX className="h-3 w-3" />
            {format(new Date(video.scheduledAt), "MMM d, yyyy h:mm a")}
          </span>
          
          <div className="flex items-center gap-2">
            {video.scheduledSocialAccounts.map((account, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {getPlatformIcon(account.platform)}
                {account.username}
              </span>
            ))}
          </div>
        </div>
        
        {result?.error && (
          <p className="text-xs text-red-500">{result.error}</p>
        )}
      </div>
    </div>
  );
}