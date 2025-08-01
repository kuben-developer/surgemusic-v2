"use client"

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { TikTokIcon, InstagramIcon, YouTubeIcon } from "./PlatformIcons";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

type Platform = 'tiktok' | 'instagram' | 'youtube';
type Status = 'posted' | 'scheduled' | 'failed';

interface PlatformStatusProps {
  platform: Platform;
  video: Doc<"generatedVideos">;
}

export function PlatformStatusBadge({ platform, video }: PlatformStatusProps) {
  // Get platform-specific data
  const getPlatformData = () => {
    switch (platform) {
      case 'tiktok':
        return {
          upload: video.tiktokUpload,
          icon: <TikTokIcon className="h-4 w-4" />,
          textColor: '',
        };
      case 'instagram':
        return {
          upload: video.instagramUpload,
          icon: <InstagramIcon className="h-4 w-4" />,
          textColor: 'text-pink-500',
        };
      case 'youtube':
        return {
          upload: video.youtubeUpload,
          icon: <YouTubeIcon className="h-4 w-4" />,
          textColor: 'text-red-500',
        };
    }
  };

  const { upload, icon, textColor } = getPlatformData();

  // Determine status and display properties
  const getStatusInfo = () => {
    if (upload?.status?.isPosted) {
      return {
        status: 'posted' as Status,
        statusIcon: <CheckCircle2 className="h-3 w-3" />,
        statusText: "Posted",
        statusLink: upload.post?.url || null,
      };
    }
    
    if (upload?.status?.isFailed) {
      return {
        status: 'failed' as Status,
        statusIcon: <AlertCircle className="h-3 w-3" />,
        statusText: "Failed",
        failedReason: upload.status.failedReason || null,
      };
    }
    
    if (upload?.scheduledAt) {
      return {
        status: 'scheduled' as Status,
        statusIcon: <Clock className="h-3 w-3" />,
        statusText: "Scheduled",
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  
  // Don't render if no status
  if (!statusInfo) return null;

  // Get platform-specific badge styles
  const getBadgeClass = (status: Status) => {
    switch (status) {
      case 'posted':
        return "bg-emerald-50/30 border-emerald-200 text-emerald-600 dark:bg-emerald-950/10 dark:border-emerald-900/20 dark:text-emerald-400";
      case 'scheduled':
        return "bg-amber-50/30 border-amber-200 text-amber-600 dark:bg-amber-950/10 dark:border-amber-900/20 dark:text-amber-400";
      case 'failed':
        return "bg-red-50/30 border-red-200 text-red-600 dark:bg-red-950/10 dark:border-red-900/20 dark:text-red-400";
      default:
        return "bg-muted/10 border-muted/20 text-foreground";
    }
  };

  const { status, statusIcon, statusText, statusLink, failedReason } = statusInfo;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`h-6 px-2 w-36 rounded-md cursor-pointer flex items-center gap-1.5 ${getBadgeClass(status)} hover:brightness-105 transition-colors`}
          >
            <div className={`flex-shrink-0 mr-3 flex items-center justify-center ${textColor}`}>
              {icon}
            </div>
            {statusIcon}
            <span className="text-xs flex items-center gap-1">
              {statusText}
              {statusLink && (
                <a
                  href={statusLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {status === 'failed' && failedReason ? (
            <div>
              <p className="font-medium capitalize">{platform} - {statusText}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reason: {failedReason}
              </p>
            </div>
          ) : (
            <p className="font-medium capitalize">{platform} - {statusText}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}