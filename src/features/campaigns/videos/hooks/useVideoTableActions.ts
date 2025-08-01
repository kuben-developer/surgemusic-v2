"use client";

import { useState } from "react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type VideoData = Doc<"generatedVideos">;

interface UseVideoTableActionsProps {
  videos: VideoData[];
  handleDownloadVideo: (videoUrl: string, videoName: string, videoId: string) => void;
  handleDownloadAll: (videos: VideoData[]) => Promise<void>;
}

export function useVideoTableActions({
  videos,
  handleDownloadVideo,
  handleDownloadAll
}: UseVideoTableActionsProps) {
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false);

  const handleDownloadSelected = async (selectedVideos: string[]) => {
    if (selectedVideos.length === 0) return;

    setIsDownloadingSelected(true);

    try {
      // Get the selected video objects
      const videosToDownload = videos.filter(video =>
        selectedVideos.includes(String(video._id))
      );

      // If there's only one video, download it directly
      if (videosToDownload.length === 1) {
        const video = videosToDownload[0];
        if (video && video.video.url && video.video.name) {
          await handleDownloadVideo(video.video.url, video.video.name, String(video._id));
        }
      } else {
        // Download all selected videos as a zip file
        await handleDownloadAll(videosToDownload);
      }
    } catch (error) {
      console.error("Error downloading selected videos:", error);
    } finally {
      setIsDownloadingSelected(false);
    }
  };

  return {
    isDownloadingSelected,
    handleDownloadSelected,
  };
}