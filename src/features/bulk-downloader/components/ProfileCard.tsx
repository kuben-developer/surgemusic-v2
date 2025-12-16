"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import type { ProfileProgress, ProfileStatus } from "../types/bulk-downloader.types";

interface ProfileCardProps {
  profile: ProfileProgress;
}

const STATUS_CONFIG: Record<
  ProfileStatus,
  { icon: React.ComponentType<{ className?: string }>; label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { icon: Clock, label: "Pending", variant: "secondary" },
  fetching: { icon: Search, label: "Fetching", variant: "outline" },
  downloading: { icon: Download, label: "Downloading", variant: "default" },
  completed: { icon: CheckCircle2, label: "Completed", variant: "secondary" },
  failed: { icon: XCircle, label: "Failed", variant: "destructive" },
};

export function ProfileCard({ profile }: ProfileCardProps) {
  const { username, profilePicture, nickname, status, totalVideos, downloadedVideos, errorMessage } = profile;

  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const progress = totalVideos > 0 ? (downloadedVideos / totalVideos) * 100 : 0;
  const isActive = status === "fetching" || status === "downloading";

  return (
    <Card className={isActive ? "border-primary" : undefined}>
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profilePicture} alt={username} />
          <AvatarFallback className="text-lg">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {nickname || `@${username}`}
            </p>
            <Badge variant={config.variant} className="gap-1 shrink-0">
              {isActive ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <StatusIcon className="h-3 w-3" />
              )}
              {config.label}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground truncate">
            @{username}
          </p>

          {(status === "downloading" || status === "completed") && totalVideos > 0 && (
            <>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {downloadedVideos} / {totalVideos} videos
              </p>
            </>
          )}

          {status === "fetching" && (
            <p className="text-xs text-muted-foreground">
              Finding videos...
            </p>
          )}

          {status === "failed" && errorMessage && (
            <p className="text-xs text-destructive truncate">
              {errorMessage}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
