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

  // Group clips by video name and filter out failed videos
  const videoGroups = useMemo(() => {
    const allGroups = groupClipsByVideo(clips);
    const filteredGroups = new Map<string, ClipperClip[]>();

    // Only include groups where video name doesn't contain "_failed"
    for (const [videoName, videoClips] of allGroups.entries()) {
      if (!videoName.includes("_failed")) {
        filteredGroups.set(videoName, videoClips);
      }
    }

    return filteredGroups;
  }, [clips]);

  // Get sorted video names (already filtered)
  const videoNames = useMemo(
    () => getSortedVideoNames(videoGroups),
    [videoGroups]
  );

  // Get all non-failed clips for "All Clips" tab
  const allNonFailedClips = useMemo(() => {
    return Array.from(videoGroups.values()).flat();
  }, [videoGroups]);

  // Filter clips based on selected video
  const filteredClips = useMemo(() => {
    if (selectedVideo === ALL_CLIPS_TAB) {
      return allNonFailedClips;
    }
    return videoGroups.get(selectedVideo) || [];
  }, [selectedVideo, allNonFailedClips, videoGroups]);

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
