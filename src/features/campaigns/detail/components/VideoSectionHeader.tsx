"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, Download, Loader2, Pencil, Save, X, CalendarPlus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface VideoSectionHeaderProps {
  videosCount: number;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  onOpenScheduleDialog: () => void;
  onDownloadAll: () => void;
  hasVideos: boolean;
  downloadingAll?: boolean;
  campaign?: {
    _id: Id<"campaigns">;
    caption?: string;
  };
}

export function VideoSectionHeader({
  videosCount,
  statusFilter,
  onStatusFilterChange,
  onOpenScheduleDialog,
  onDownloadAll,
  hasVideos,
  downloadingAll = false,
  campaign,
}: VideoSectionHeaderProps) {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [caption, setCaption] = useState(campaign?.caption || "");
  const [isSaving, setIsSaving] = useState(false);
  const updateCaption = useMutation(api.app.campaigns.updateCaption);

  useEffect(() => {
    setCaption(campaign?.caption || "");
  }, [campaign?.caption]);

  const handleSaveCaption = async () => {
    const trimmedCaption = caption.trim();
    
    if (!campaign || trimmedCaption === campaign.caption) {
      setIsEditingCaption(false);
      return;
    }

    try {
      setIsSaving(true);
      await updateCaption({
        campaignId: campaign._id,
        caption: trimmedCaption
      });
      toast.success("Caption updated");
      setIsEditingCaption(false);
    } catch (error) {
      // Check if it's a uniqueness error
      if (error instanceof Error && error.message.includes("already used")) {
        toast.error("This caption is already taken");
      } else {
        toast.error("Failed to update caption");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelCaption = () => {
    setCaption(campaign?.caption || "");
    setIsEditingCaption(false);
  };

  return (
    <div className="space-y-4">
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

          {hasVideos && (
            <Button
              onClick={onOpenScheduleDialog}
              className="gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              Schedule Videos
            </Button>
          )}

          {hasVideos && (
            <Button
              variant="outline"
              onClick={() => onDownloadAll()}
              disabled={downloadingAll}
              className="gap-2 bg-background/50 hover:bg-background border-primary/20 hover:border-primary/40"
            >
              {downloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloadingAll ? "Downloading..." : "Download All"}
            </Button>
          )}
        </div>
      </div>

      {/* Caption input field */}
      {campaign && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Caption:</span>
          {isEditingCaption ? (
            <>
              <Input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter campaign caption..."
                className="flex-1 max-w-md h-8 text-sm"
                disabled={isSaving}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSaveCaption}
                disabled={isSaving}
                className="h-8 px-2"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelCaption}
                disabled={isSaving}
                className="h-8 px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm">
                {campaign.caption || "No caption set"}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingCaption(true)}
                className="h-8 px-2"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
