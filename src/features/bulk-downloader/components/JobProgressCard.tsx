"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Download,
  FileArchive,
  Loader2,
  Search,
  Upload,
  XCircle,
} from "lucide-react";
import { ProfileCard } from "./ProfileCard";
import { DownloadReadyCard } from "./DownloadReadyCard";
import type { BulkDownloadJob, JobStatus, ProfileProgress } from "../types/bulk-downloader.types";

interface JobProgressCardProps {
  job: BulkDownloadJob;
}

const STATUS_CONFIG: Record<
  JobStatus,
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  pending: { icon: Clock, label: "Pending", color: "text-muted-foreground" },
  fetching: { icon: Search, label: "Fetching", color: "text-blue-500" },
  downloading: { icon: Download, label: "Downloading", color: "text-primary" },
  zipping: { icon: FileArchive, label: "Creating ZIP", color: "text-orange-500" },
  uploading: { icon: Upload, label: "Uploading", color: "text-purple-500" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-green-500" },
  failed: { icon: XCircle, label: "Failed", color: "text-destructive" },
};

export function JobProgressCard({ job }: JobProgressCardProps) {
  const config = STATUS_CONFIG[job.status];
  const StatusIcon = config.icon;
  const isProcessing = !["completed", "failed"].includes(job.status);

  // Calculate overall progress
  const overallProgress =
    job.progress.totalItems > 0
      ? (job.progress.processedItems / job.progress.totalItems) * 100
      : 0;

  // If completed, show download card
  if (job.status === "completed" && job.result) {
    return <DownloadReadyCard job={job} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isProcessing ? (
                <Loader2 className={`h-5 w-5 animate-spin ${config.color}`} />
              ) : (
                <StatusIcon className={`h-5 w-5 ${config.color}`} />
              )}
              {config.label}
            </CardTitle>
            <CardDescription>{job.progress.currentPhase}</CardDescription>
          </div>
          <Badge variant={job.type === "videos" ? "default" : "secondary"}>
            {job.type === "videos" ? "Video URLs" : "Profile URLs"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {job.progress.downloadedVideos} videos downloaded
              {job.progress.failedVideos > 0 && (
                <span className="text-destructive ml-2">
                  ({job.progress.failedVideos} failed)
                </span>
              )}
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Profile Progress (for profile jobs) */}
        {job.type === "profiles" && job.profileProgress && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Profiles</h4>
            <div className="grid gap-3">
              {(job.profileProgress as ProfileProgress[]).map((profile) => (
                <ProfileCard key={profile.username} profile={profile} />
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {job.status === "failed" && job.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{job.error}</p>
          </div>
        )}

        {/* Failed URLs */}
        {job.failedUrls && job.failedUrls.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive">
              Failed URLs ({job.failedUrls.length})
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {job.failedUrls.slice(0, 5).map((failed, idx) => (
                <div key={idx} className="text-xs p-2 bg-muted rounded">
                  <p className="font-mono truncate">{failed.url}</p>
                  <p className="text-muted-foreground">{failed.reason}</p>
                </div>
              ))}
              {job.failedUrls.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  ... and {job.failedUrls.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
