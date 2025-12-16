"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useJobHistory } from "../hooks/useJobHistory";
import { formatFileSize, formatExpiryDate, isDownloadExpired } from "../utils/url-parser.utils";
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
  onRegenerateUrl,
}: {
  job: BulkDownloadJob;
  onDelete: () => void;
  onRegenerateUrl: () => Promise<string | null>;
}) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const StatusIcon = STATUS_ICONS[job.status];
  const isCompleted = job.status === "completed";
  const result = job.result as JobResult | undefined;
  const expired = result ? isDownloadExpired(result.expiresAt) : false;

  const handleDownload = () => {
    if (result && !expired) {
      window.open(result.zipUrl, "_blank");
    }
  };

  const handleRefresh = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateUrl();
    } finally {
      setIsRegenerating(false);
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
              &middot; {result.totalVideosInZip} videos &middot;{" "}
              {formatFileSize(result.zipSize)}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isCompleted && result && (
          <>
            {expired ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </>
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
                This will remove the download job from your history. The ZIP file
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
  const { completedJobs, isLoading, deleteJob, regenerateDownloadUrl } = useJobHistory(10);

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
            onRegenerateUrl={() => regenerateDownloadUrl(job._id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
