"use client";

import { motion } from "framer-motion";
import { Play, Lock } from "lucide-react";

interface VideoTrialOverlayProps {
  /** Whether the trial overlay should be shown */
  isVisible: boolean;
  /** Additional classes for styling */
  className?: string;
}

export function VideoTrialOverlay({ isVisible, className = "" }: VideoTrialOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 backdrop-blur-sm bg-black/30 z-30 rounded-lg flex items-center justify-center ${className}`}
    >
      <div className="text-center text-white space-y-3 p-4">
        <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Start Trial to View</p>
          <p className="text-xs text-white/80">3-day free trial</p>
        </div>
      </div>
    </motion.div>
  );
}