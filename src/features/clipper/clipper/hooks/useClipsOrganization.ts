"use client";

import { useState, useMemo } from "react";
import type { ClipperClip } from "../../shared/types/common.types";
import {
  groupClipsByVideo,
  getSortedVideoNames,
} from "../utils/video-organization.utils";

const ALL_CLIPS_TAB = "all";

export function useClipsOrganization(clips: ClipperClip[]) {
  const [selectedVideo, setSelectedVideo] = useState<string>(ALL_CLIPS_TAB);

  // Group clips by video name
  const videoGroups = useMemo(() => groupClipsByVideo(clips), [clips]);

  // Get sorted video names
  const videoNames = useMemo(
    () => getSortedVideoNames(videoGroups),
    [videoGroups]
  );

  // Filter clips based on selected video
  const filteredClips = useMemo(() => {
    if (selectedVideo === ALL_CLIPS_TAB) {
      return clips;
    }
    return videoGroups.get(selectedVideo) || [];
  }, [selectedVideo, clips, videoGroups]);

  // Reset to "All" tab when clips change significantly
  const resetToAllTab = () => {
    setSelectedVideo(ALL_CLIPS_TAB);
  };

  return {
    selectedVideo,
    setSelectedVideo,
    videoGroups,
    videoNames,
    filteredClips,
    resetToAllTab,
    hasMultipleVideos: videoNames.length > 1,
  };
}
