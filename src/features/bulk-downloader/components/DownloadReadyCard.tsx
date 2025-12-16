"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Download,
  FileArchive,
  Loader2,
} from "lucide-react";
import { formatFileSize } from "../utils/url-parser.utils";
import type { BulkDownloadJob, JobResult } from "../types/bulk-downloader.types";

interface DownloadReadyCardProps {
  job: BulkDownloadJob;
}

export function DownloadReadyCard({ job }: DownloadReadyCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadPhase, setDownloadPhase] = useState("");

  const result = job.result as JobResult;

  const handleDownload = async () => {
    if (isDownloading || !result?.videos?.length) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadPhase("Preparing download...");

    try {
      const zip = new JSZip();
      const totalVideos = result.videos.length;

      // Download each video and add to ZIP
      for (let i = 0; i < totalVideos; i++) {
        const video = result.videos[i];
        if (!video) continue;

        setDownloadPhase(`Downloading video ${i + 1} of ${totalVideos}...`);
        setDownloadProgress(Math.round((i / totalVideos) * 80)); // 80% for downloading

        try {
          const response = await fetch(video.url);
          if (!response.ok) {
            console.error(`Failed to fetch ${video.filename}: HTTP ${response.status}`);
            continue;
          }

          const blob = await response.blob();
          zip.file(video.filename, blob);
        } catch (fetchError) {
          console.error(`Failed to fetch ${video.filename}:`, fetchError);
          continue;
        }
      }

      setDownloadPhase("Creating ZIP file...");
      setDownloadProgress(85);

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 5 },
      }, (metadata) => {
        // Update progress during ZIP generation
        setDownloadProgress(85 + Math.round(metadata.percent * 0.15));
      });

      setDownloadPhase("Starting download...");
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

      setDownloadPhase("Download complete!");
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadPhase("Download failed. Please try again.");
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadPhase("");
      }, 2000);
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
              {result.totalVideos} videos
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(result.totalSize)}
            </p>
          </div>
          <Button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download ZIP
              </>
            )}
          </Button>
        </div>

        {/* Download progress */}
        {isDownloading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{downloadPhase}</span>
              <span className="font-medium">{downloadProgress}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        )}

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
