"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  Clock,
  Download,
  FileArchive,
  History,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import { useJobHistory } from "../hooks/useJobHistory";
import { formatFileSize } from "../utils/url-parser.utils";
import type { BulkDownloadJob, JobResult, JobStatus } from "../types/bulk-downloader.types";

const STATUS_ICONS: Record<JobStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  fetching: Loader2,
  downloading: Download,
  zipping: FileArchive,
  uploading: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

function JobHistoryItem({
  job,
  onDelete,
}: {
  job: BulkDownloadJob;
  onDelete: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const StatusIcon = STATUS_ICONS[job.status];
  const isCompleted = job.status === "completed";
  const result = job.result as JobResult | undefined;

  const handleDownload = async () => {
    if (isDownloading || !result?.videos?.length) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const totalVideos = result.videos.length;

      // Download each video and add to ZIP
      for (let i = 0; i < totalVideos; i++) {
        const video = result.videos[i];
        if (!video) continue;

        setDownloadProgress(Math.round((i / totalVideos) * 80));

        try {
          const response = await fetch(video.url);
          if (!response.ok) continue;

          const blob = await response.blob();
          zip.file(video.filename, blob);
        } catch {
          continue;
        }
      }

      setDownloadProgress(85);

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 5 },
      }, (metadata) => {
        setDownloadProgress(85 + Math.round(metadata.percent * 0.15));
      });

      setDownloadProgress(100);

      // Trigger download
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `bulk-download-${job._id}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    }
  };

  const createdDate = new Date(job.createdAt).toLocaleDateString();

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div
        className={`p-2 rounded-lg ${
          isCompleted
            ? "bg-green-500/10"
            : job.status === "failed"
              ? "bg-destructive/10"
              : "bg-primary/10"
        }`}
      >
        <StatusIcon
          className={`h-5 w-5 ${
            isCompleted
              ? "text-green-500"
              : job.status === "failed"
                ? "text-destructive"
                : "text-primary"
          } ${["fetching", "downloading", "zipping", "uploading"].includes(job.status) ? "animate-spin" : ""}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {job.type === "videos" ? "Video URLs" : "Profile URLs"}
          </p>
          <Badge variant="outline" className="text-xs">
            {job.progress.totalItems} {job.type === "videos" ? "videos" : "profiles"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {createdDate}
          {isCompleted && result && (
            <span className="ml-2">
              &middot; {result.totalVideos} videos &middot;{" "}
              {formatFileSize(result.totalSize)}
            </span>
          )}
        </p>
        {isDownloading && (
          <Progress value={downloadProgress} className="h-1 mt-2" />
        )}
      </div>

      <div className="flex items-center gap-2">
        {isCompleted && result && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this download?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the download job from your history. The video files
                will no longer be accessible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function JobHistory() {
  const { completedJobs, isLoading, deleteJob } = useJobHistory(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!completedJobs || completedJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Downloads
          </CardTitle>
          <CardDescription>Your completed downloads will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileArchive className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No downloads yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Downloads
        </CardTitle>
        <CardDescription>
          Your completed downloads from the last sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {completedJobs.map((job) => (
          <JobHistoryItem
            key={job._id}
            job={job}
            onDelete={() => deleteJob(job._id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
