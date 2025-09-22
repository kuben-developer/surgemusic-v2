"use client";

import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface VideoTrialOverlayProps {
  /** Whether the trial overlay should be shown */
  isVisible: boolean;
  /** Additional classes for styling */
  className?: string;
  /** Callback when play button is clicked */
  onPlayClick?: () => void;
  /** Whether the video is currently playing */
  isPlaying?: boolean;
}

export function VideoTrialOverlay({
  isVisible,
  className = "",
  onPlayClick,
  isPlaying = false
}: VideoTrialOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 backdrop-blur-sm bg-black/30 z-30 rounded-lg flex items-center justify-center transition-all duration-300 ${className}`}
    >
      <div className="text-center text-white space-y-3 p-4">
        <div
          className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-2 border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer active:scale-95"
          onClick={onPlayClick}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Start Trial to View</p>
          <p className="text-xs text-white/80">3-day free trial</p>
        </div>
      </div>
    </motion.div>
  );
}