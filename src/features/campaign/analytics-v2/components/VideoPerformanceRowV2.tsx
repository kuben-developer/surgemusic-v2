"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle, Share2, ExternalLink, Bookmark } from "lucide-react";
import { VideoSparkChart } from "./VideoSparkChart";
import { useCounterAnimation } from "../hooks/useCounterAnimation";
import type { VideoPerformanceRow } from "../types/analytics-v2.types";

interface VideoPerformanceRowV2Props {
  video: VideoPerformanceRow;
}

function AnimatedMetric({
  value,
  icon: Icon,
  colorClass,
}: {
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  const animated = useCounterAnimation(value, { duration: 1200, ease: "easeOut" });
  return (
    <div className="flex items-center gap-1 justify-center sm:justify-start sm:min-w-[55px]">
      <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
      <span className="tabular-nums text-xs">{animated.toLocaleString()}</span>
    </div>
  );
}

function VideoPerformanceRowV2Inner({ video }: VideoPerformanceRowV2Props) {
  const videoUrl =
    video.mediaUrl ||
    `https://www.tiktok.com/@/video/${video.tiktokVideoId}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Spark chart */}
        <VideoSparkChart tiktokVideoId={video.tiktokVideoId} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate text-sm">
              {video.tiktokVideoId}
            </h4>
            {video.isManual && (
              <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                Manual
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {new Date(video.postedAt * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden xs:inline">TikTok</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:flex sm:items-center gap-2 sm:gap-2.5 text-xs pl-0 sm:ml-auto">
        <AnimatedMetric
          value={video.views}
          icon={Eye}
          colorClass="text-green-600 dark:text-green-400"
        />
        <AnimatedMetric
          value={video.likes}
          icon={Heart}
          colorClass="text-orange-600 dark:text-orange-400"
        />
        <AnimatedMetric
          value={video.comments}
          icon={MessageCircle}
          colorClass="text-red-600 dark:text-red-400"
        />
        <AnimatedMetric
          value={video.shares}
          icon={Share2}
          colorClass="text-blue-600 dark:text-blue-400"
        />
        <AnimatedMetric
          value={video.saves}
          icon={Bookmark}
          colorClass="text-amber-600 dark:text-amber-400"
        />
      </div>
    </div>
  );
}

export const VideoPerformanceRowV2 = React.memo(VideoPerformanceRowV2Inner);
