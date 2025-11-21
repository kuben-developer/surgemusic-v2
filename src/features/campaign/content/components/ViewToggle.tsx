"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Clock, CheckCircle } from "lucide-react";

export type VideoView = "published" | "ready";

interface ViewToggleProps {
  view: VideoView;
  onViewChange: (view: VideoView) => void;
  publishedCount: number;
  processingCount: number;
  processedCount: number;
}

export function ViewToggle({
  view,
  onViewChange,
  publishedCount,
  processingCount,
  processedCount,
}: ViewToggleProps) {
  const readyCount = processingCount + processedCount;

  return (
    <div className="flex items-center justify-between">
      <Tabs value={view} onValueChange={(v) => onViewChange(v as VideoView)}>
        <TabsList>
          <TabsTrigger value="published" className="cursor-pointer gap-2">
            <Eye className="size-4" />
            Published
            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              {publishedCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ready" className="cursor-pointer gap-2">
            <Clock className="size-4" />
            Ready to Publish
            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              {readyCount}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Show breakdown when on Ready tab */}
      {view === "ready" && readyCount > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-amber-500" />
            <span>{processingCount} processing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="size-3.5 text-green-500" />
            <span>{processedCount} ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
