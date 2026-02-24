"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Bookmark,
  MousePointerClick,
  Play,
} from "lucide-react";
import { TikTokThumbnail } from "./TikTokThumbnail";
import { useCounterAnimation } from "../hooks/useCounterAnimation";
import type { VideoPerformanceRow } from "../types/analytics-v2.types";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { InstagramColorIcon } from "@/components/icons/InstagramIcon";

interface VideoPerformanceRowV2Props {
  video: VideoPerformanceRow;
  showPlatformBadge?: boolean;
}

function AnimatedMetric({
  value,
  label,
  icon: Icon,
  colorClass,
}: {
  value: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  const animated = useCounterAnimation(value, { duration: 1200, ease: "easeOut" });
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`h-3 w-3 flex-shrink-0 ${colorClass}`} />
      <span className="tabular-nums text-xs font-medium">{animated.toLocaleString()}</span>
      <span className="text-[10px] text-muted-foreground hidden sm:inline">{label}</span>
    </div>
  );
}

function EngagementRate({ views, likes, comments, shares }: {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}) {
  const rate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;
  const display = rate >= 10 ? rate.toFixed(1) : rate.toFixed(2);
  return (
    <div className="flex items-center gap-1.5">
      <MousePointerClick className="h-3 w-3 flex-shrink-0 text-violet-600 dark:text-violet-400" />
      <span className="tabular-nums text-xs font-medium">{display}%</span>
      <span className="text-[10px] text-muted-foreground hidden sm:inline">Eng.</span>
    </div>
  );
}

function VideoPerformanceRowV2Inner({ video, showPlatformBadge = false }: VideoPerformanceRowV2Props) {
  const isInstagram = video.platform === "instagram";
  const videoUrl = isInstagram
    ? video.mediaUrl || `https://www.instagram.com/p/${video.tiktokVideoId}/`
    : video.mediaUrl || `https://www.tiktok.com/@/video/${video.tiktokVideoId}`;

  const postedDate = new Date(video.postedAt * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
      {/* Thumbnail */}
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0"
      >
        {isInstagram ? (
          <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt="Instagram thumbnail"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          <TikTokThumbnail tiktokVideoId={video.tiktokVideoId} />
        )}
      </a>

      {/* Middle: date + badge + stats grid */}
      <div className="flex-1 min-w-0">
        {/* Date row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{postedDate}</span>
          {video.isManual && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Manual
            </Badge>
          )}
          {showPlatformBadge && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
              {isInstagram ? (
                <><InstagramColorIcon className="h-3 w-3" /> Instagram</>
              ) : (
                <><TikTokIcon className="h-3 w-3" /> TikTok</>
              )}
            </Badge>
          )}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-0.5 ml-auto sm:ml-0"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Stats grid */}
        {isInstagram ? (
          <div className="grid grid-cols-2 max-w-[66%] gap-x-4 gap-y-1.5">
            <AnimatedMetric value={video.views} label="Views" icon={Eye} colorClass="text-green-600 dark:text-green-400" />
            <AnimatedMetric value={video.likes} label="Likes" icon={Heart} colorClass="text-orange-600 dark:text-orange-400" />
            <AnimatedMetric value={video.comments} label="Cmts" icon={MessageCircle} colorClass="text-red-600 dark:text-red-400" />
            <EngagementRate views={video.views} likes={video.likes} comments={video.comments} shares={0} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
            <AnimatedMetric value={video.views} label="Views" icon={Eye} colorClass="text-green-600 dark:text-green-400" />
            <AnimatedMetric value={video.likes} label="Likes" icon={Heart} colorClass="text-orange-600 dark:text-orange-400" />
            <AnimatedMetric value={video.comments} label="Cmts" icon={MessageCircle} colorClass="text-red-600 dark:text-red-400" />
            <AnimatedMetric value={video.shares} label="Shares" icon={Share2} colorClass="text-blue-600 dark:text-blue-400" />
            <AnimatedMetric value={video.saves} label="Saves" icon={Bookmark} colorClass="text-amber-600 dark:text-amber-400" />
            <EngagementRate views={video.views} likes={video.likes} comments={video.comments} shares={video.shares} />
          </div>
        )}
      </div>

    </div>
  );
}

export const VideoPerformanceRowV2 = React.memo(VideoPerformanceRowV2Inner);
