"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClipperClip } from "../../shared/types/common.types";

interface ClipsVideoTabsProps {
  videoNames: string[];
  videoGroups: Map<string, ClipperClip[]>;
  selectedVideo: string;
  onVideoChange: (video: string) => void;
}

const ALL_CLIPS_TAB = "all";

export function ClipsVideoTabs({
  videoNames,
  videoGroups,
  selectedVideo,
  onVideoChange,
}: ClipsVideoTabsProps) {
  // Don't render tabs if there's only one video or no videos
  if (videoNames.length <= 1) {
    return null;
  }

  const totalClips = Array.from(videoGroups.values()).reduce(
    (sum, clips) => sum + clips.length,
    0
  );

  return (
    <div className="border-b pb-4">
      <Tabs value={selectedVideo} onValueChange={onVideoChange}>
        <TabsList className="h-auto flex-wrap justify-start gap-2">
          {/* All Clips Tab */}
          <TabsTrigger value={ALL_CLIPS_TAB} className="gap-2">
            All Clips
            <span className="text-xs text-muted-foreground">({totalClips})</span>
          </TabsTrigger>

          {/* Individual Video Tabs */}
          {videoNames.map((videoName) => {
            const clipCount = videoGroups.get(videoName)?.length || 0;
            return (
              <TabsTrigger key={videoName} value={videoName} className="gap-2">
                <span className="max-w-[200px] truncate" title={videoName}>
                  {videoName}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({clipCount})
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
