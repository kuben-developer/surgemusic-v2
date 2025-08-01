"use client"

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, Download } from "lucide-react";
import { ViewToggle } from "@/features/campaigns/videos";

type ViewMode = "table" | "grid";

interface VideoSectionHeaderProps {
  videosCount: number;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onDownloadAll: () => void;
  hasVideos: boolean;
}

export function VideoSectionHeader({
  videosCount,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onDownloadAll,
  hasVideos,
}: VideoSectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-50" />
          <div className="relative bg-primary/10 p-3 rounded-full border border-primary/20">
            <Video className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Generated Videos</h2>
          <p className="text-sm text-muted-foreground">
            {videosCount} videos available
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Videos</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="unscheduled">Unscheduled</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <ViewToggle viewMode={viewMode} setViewMode={onViewModeChange} />

        {hasVideos && (
          <Button
            variant="outline"
            onClick={onDownloadAll}
            className="gap-2 bg-background/50 hover:bg-background border-primary/20 hover:border-primary/40"
          >
            <Download className="w-4 h-4" />
            Download All
          </Button>
        )}
      </div>
    </div>
  );
}