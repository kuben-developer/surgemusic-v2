"use client";

import { useState } from "react";
import type { VideoCountOption } from "../constants/video-options";
import { CUSTOM_VIDEO_CONFIG } from "../constants/video-options";

interface UseVideoCountLogicProps {
  selectedVideoCount: number | null;
  setSelectedVideoCount: (count: number | null) => void;
}

export function useVideoCountLogic({
  selectedVideoCount,
  setSelectedVideoCount
}: UseVideoCountLogicProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customVideoCount, setCustomVideoCount] = useState<number>(CUSTOM_VIDEO_CONFIG.MIN_COUNT);

  const handleCustomSliderChange = (value: number[]) => {
    const firstValue = value[0];
    if (firstValue !== undefined) {
      const roundedValue = Math.round(firstValue / CUSTOM_VIDEO_CONFIG.STEP) * CUSTOM_VIDEO_CONFIG.STEP;
      setCustomVideoCount(roundedValue);
      setSelectedVideoCount(roundedValue);
    }
  };

  const handlePresetSelection = (count: VideoCountOption | 6) => {
    setIsCustomMode(false);
    setSelectedVideoCount(count);
  };

  const handleCustomModeToggle = () => {
    setIsCustomMode(true);
    setSelectedVideoCount(customVideoCount);
  };

  const isOptionLocked = (requiredCredits: number, isSubscribed: boolean, totalCredits: number) => {
    return !isSubscribed || totalCredits < requiredCredits;
  };

  const getLockReason = (requiredCredits: number, isSubscribed: boolean) => {
    return !isSubscribed ? "Subscription required" : `Requires ${requiredCredits} credits`;
  };

  return {
    isCustomMode,
    customVideoCount,
    handleCustomSliderChange,
    handlePresetSelection,
    handleCustomModeToggle,
    isOptionLocked,
    getLockReason,
  };
}