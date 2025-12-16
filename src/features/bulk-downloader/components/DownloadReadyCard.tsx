"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Download,
  FileArchive,
  Loader2,
  RefreshCw,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useJobHistory } from "../hooks/useJobHistory";
import { formatFileSize, formatExpiryDate, isDownloadExpired } from "../utils/url-parser.utils";
import type { BulkDownloadJob, JobResult } from "../types/bulk-downloader.types";

interface DownloadReadyCardProps {
  job: BulkDownloadJob;
}

export function DownloadReadyCard({ job }: DownloadReadyCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { regenerateDownloadUrl } = useJobHistory();

  const result = job.result as JobResult;
  const expired = isDownloadExpired(result.expiresAt);

  const handleDownload = () => {
    if (!expired) {
      window.open(result.zipUrl, "_blank");
    }
  };

  const handleRefreshUrl = async () => {
    setIsRefreshing(true);
    try {
      const newUrl = await regenerateDownloadUrl(job._id);
      if (newUrl) {
        // The job will be updated via subscription, so we don't need to do anything else
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="border-green-500/50 bg-green-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Download Ready
            </CardTitle>
            <CardDescription>
              Your videos have been processed and are ready to download
            </CardDescription>
          </div>
          <Badge variant={job.type === "videos" ? "default" : "secondary"}>
            {job.type === "videos" ? "Video URLs" : "Profile URLs"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File info */}
        <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileArchive className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {result.totalVideosInZip} videos
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(result.zipSize)}
            </p>
          </div>
          {expired ? (
            <Button
              onClick={handleRefreshUrl}
              disabled={isRefreshing}
              variant="outline"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Link
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download ZIP
            </Button>
          )}
        </div>

        {/* Expiry info */}
        <div className="flex items-center gap-2 text-sm">
          {expired ? (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-amber-600">
                Download link expired. Click &quot;Refresh Link&quot; to get a new one.
              </span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Link expires: {formatExpiryDate(result.expiresAt)}
              </span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {job.progress.downloadedVideos}
            </p>
            <p className="text-xs text-muted-foreground">Downloaded</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {job.progress.totalItems}
            </p>
            <p className="text-xs text-muted-foreground">
              {job.type === "videos" ? "URLs" : "Profiles"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">
              {job.progress.failedVideos}
            </p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>

        {/* Failed URLs */}
        {job.failedUrls && job.failedUrls.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-medium text-destructive">
              Failed URLs ({job.failedUrls.length})
            </h4>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {job.failedUrls.slice(0, 3).map((failed, idx) => (
                <div key={idx} className="text-xs p-2 bg-muted rounded">
                  <p className="font-mono truncate">{failed.url}</p>
                  <p className="text-muted-foreground">{failed.reason}</p>
                </div>
              ))}
              {job.failedUrls.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ... and {job.failedUrls.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
