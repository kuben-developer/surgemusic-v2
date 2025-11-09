"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface VideoRowSelectionProps {
  video: Doc<"generatedVideos">;
  isSelected: boolean;
  isScheduled: boolean;
  onToggleSelect: (id: string, event?: React.MouseEvent | MouseEvent) => void;
}

export function VideoRowSelection({ 
  video, 
  isSelected, 
  isScheduled, 
  onToggleSelect 
}: VideoRowSelectionProps) {
  const handleCheckedChange = () => {
    // Get the current event to check for shift key
    const event = window.event as MouseEvent | undefined;
    onToggleSelect(String(video._id), event);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default checkbox behavior to handle shift-click ourselves
    if (e.shiftKey) {
      e.preventDefault();
      onToggleSelect(String(video._id), e);
    }
  };

  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={handleCheckedChange}
      onClick={handleClick}
      aria-label={`Select ${video.video.name}`}
      disabled={isScheduled}
    />
  );
}