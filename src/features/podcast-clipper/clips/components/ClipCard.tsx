"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Clock, MessageSquareQuote, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { CLIP_STATUS_LABELS } from "../../shared/constants/podcast-clipper.constants";
import type { PodcastClipperClip } from "../../shared/types/podcast-clipper.types";

interface ClipCardProps {
  clip: PodcastClipperClip;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    case "approved":
      return "outline";
    default:
      return "secondary";
  }
}

export function ClipCard({ clip }: ClipCardProps) {
  const deleteClip = useMutation(api.app.podcastClipperClipsDb.deleteClip);
  const duration = clip.endTime - clip.startTime;
  const statusLabel = CLIP_STATUS_LABELS[clip.status] ?? clip.status;
  const finalUrl = clip.finalVideoUrl ?? clip.reframedVideoUrl ?? clip.cutVideoUrl;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">
              {clip.title ?? `Clip ${clip.clipIndex + 1}`}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</span>
              <span>&middot;</span>
              <span>{Math.round(duration)}s</span>
            </div>
          </div>
          <Badge variant={getStatusVariant(clip.status)} className="shrink-0">
            {statusLabel}
          </Badge>
        </div>

        {/* Hook text */}
        <div className="flex items-start gap-2">
          <MessageSquareQuote className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground italic">{clip.hookText}</p>
        </div>

        {/* Error */}
        {clip.errorMessage && (
          <p className="text-xs text-destructive">{clip.errorMessage}</p>
        )}

        {/* Video player / actions when completed */}
        {finalUrl && clip.status === "completed" && (
          <div className="space-y-2">
            <video
              src={finalUrl}
              controls
              className="w-full rounded-md aspect-[9/16] max-h-[300px] bg-black object-contain"
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href={finalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Open
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={finalUrl} download={`clip_${clip.clipIndex + 1}.mp4`}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive ml-auto"
                onClick={() => deleteClip({ clipId: clip._id })}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
