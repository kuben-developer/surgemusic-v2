"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, Calendar, Video } from "lucide-react";

export type VideoView = "processing" | "ready" | "scheduled" | "published";

interface ViewToggleProps {
  view: VideoView;
  onViewChange: (view: VideoView) => void;
  processingCount: number;
  readyCount: number;
  scheduledCount: number;
  publishedCount: number;
}

export function ViewToggle({
  view,
  onViewChange,
  processingCount,
  readyCount,
  scheduledCount,
  publishedCount,
}: ViewToggleProps) {
  return (
    <Tabs value={view} onValueChange={(v) => onViewChange(v as VideoView)}>
      <TabsList>
        <TabsTrigger value="processing" className="cursor-pointer gap-2">
          <Clock className="size-4 text-amber-500" />
          Processing
          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            {processingCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="ready" className="cursor-pointer gap-2">
          <CheckCircle className="size-4 text-green-500" />
          Ready
          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            {readyCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="cursor-pointer gap-2">
          <Calendar className="size-4 text-blue-500" />
          Scheduled
          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            {scheduledCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="published" className="cursor-pointer gap-2">
          <Video className="size-4 text-purple-500" />
          Published
          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            {publishedCount}
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
