import { useState } from "react";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

type VideoData = Doc<"generatedVideos">;

export function useVideoSelection(videos: VideoData[]) {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Check if video is scheduled
  const isVideoScheduled = (video: VideoData) => {
    return (video.tiktokUpload?.scheduledAt !== undefined && video.tiktokUpload?.scheduledAt !== null) ||
           (video.instagramUpload?.scheduledAt !== undefined && video.instagramUpload?.scheduledAt !== null) ||
           (video.youtubeUpload?.scheduledAt !== undefined && video.youtubeUpload?.scheduledAt !== null);
  };

  // Sort videos by scheduled date (most recent first, then unscheduled)
  const getSortedVideos = (filteredVideos: VideoData[]) => {
    return [...filteredVideos].sort((a, b) => {
      // Get scheduled dates from any platform
      const aScheduledAt = a.tiktokUpload?.scheduledAt || a.instagramUpload?.scheduledAt || a.youtubeUpload?.scheduledAt;
      const bScheduledAt = b.tiktokUpload?.scheduledAt || b.instagramUpload?.scheduledAt || b.youtubeUpload?.scheduledAt;
      
      // If both have schedules, compare dates (most recent first)
      if (aScheduledAt && bScheduledAt) {
        return bScheduledAt - aScheduledAt;
      }
      // If only a has a schedule, a comes first
      if (aScheduledAt) return -1;
      // If only b has a schedule, b comes first
      if (bScheduledAt) return 1;
      // If neither has a schedule, sort by creation date (most recent first)
      return b._creationTime - a._creationTime;
    });
  };

  // Toggle select all videos
  const toggleSelectAll = () => {
    // Filter out scheduled videos
    const selectableVideos = videos.filter(video => !isVideoScheduled(video));

    if (selectedVideos.length === selectableVideos.length && selectableVideos.length > 0) {
      setSelectedVideos([]);
      setLastSelectedIndex(null);
    } else {
      setSelectedVideos(selectableVideos.map(video => String(video._id)));
      setLastSelectedIndex(null);
    }
  };

  // Toggle select individual video with shift-click support
  const toggleSelectVideo = (id: string, event?: React.MouseEvent | MouseEvent) => {
    // Find the video by id and its index in sortedVideos
    const video = videos.find(v => String(v._id) === id);
    
    // Don't allow selection if the video is already scheduled
    if (video && isVideoScheduled(video)) {
      return;
    }

    // Filter videos by status for proper indexing
    const filteredVideos = videos.filter(video => {
      // This should match the filtering logic from the parent component
      return true; // For now, include all videos
    });

    const sortedVideos = getSortedVideos(filteredVideos);
    const currentIndex = sortedVideos.findIndex(v => String(v._id) === id);

    // Handle shift-click for range selection
    if (event?.shiftKey && lastSelectedIndex !== null && currentIndex !== -1) {
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      
      // Get all videos in the range that are not scheduled
      const rangeVideos = sortedVideos
        .slice(start, end + 1)
        .filter(v => !isVideoScheduled(v))
        .map(v => String(v._id));
      
      // Add range videos to selection (union of existing and new)
      const newSelection = Array.from(new Set([...selectedVideos, ...rangeVideos]));
      setSelectedVideos(newSelection);
    } else {
      // Normal click behavior
      if (selectedVideos.includes(id)) {
        setSelectedVideos(selectedVideos.filter(videoId => videoId !== id));
      } else {
        setSelectedVideos([...selectedVideos, id]);
      }
      setLastSelectedIndex(currentIndex);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedVideos([]);
    setLastSelectedIndex(null);
  };

  return {
    selectedVideos,
    lastSelectedIndex,
    isVideoScheduled,
    getSortedVideos,
    toggleSelectAll,
    toggleSelectVideo,
    clearSelection,
  };
}