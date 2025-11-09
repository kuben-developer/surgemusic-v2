"use client";

import { useMemo } from "react";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface UseVideoRowDataProps {
  video: Doc<"generatedVideos">;
}

export function useVideoRowData({ video }: UseVideoRowDataProps) {
  // Get the scheduled date (first available from any platform)
  const scheduledDate = useMemo(() => {
    const scheduledAt = video.tiktokUpload?.scheduledAt || 
                      video.instagramUpload?.scheduledAt || 
                      video.youtubeUpload?.scheduledAt;
    return scheduledAt ? new Date(scheduledAt) : null;
  }, [video.tiktokUpload?.scheduledAt, video.instagramUpload?.scheduledAt, video.youtubeUpload?.scheduledAt]);

  // Check if the video is scheduled on any platform
  const isScheduled = useMemo(() => {
    return (video.tiktokUpload?.scheduledAt !== undefined && video.tiktokUpload?.scheduledAt !== null) ||
           (video.instagramUpload?.scheduledAt !== undefined && video.instagramUpload?.scheduledAt !== null) ||
           (video.youtubeUpload?.scheduledAt !== undefined && video.youtubeUpload?.scheduledAt !== null);
  }, [video.tiktokUpload?.scheduledAt, video.instagramUpload?.scheduledAt, video.youtubeUpload?.scheduledAt]);

  // Check if any platforms have uploads configured
  const hasAnyPlatformUploads = useMemo(() => {
    return !!(video.tiktokUpload || video.instagramUpload || video.youtubeUpload);
  }, [video.tiktokUpload, video.instagramUpload, video.youtubeUpload]);

  // Get video display name without extension
  const displayName = useMemo(() => {
    return video.video.name.replace(/\.[^/.]+$/, "");
  }, [video.video.name]);

  return {
    scheduledDate,
    isScheduled,
    hasAnyPlatformUploads,
    displayName,
  };
}