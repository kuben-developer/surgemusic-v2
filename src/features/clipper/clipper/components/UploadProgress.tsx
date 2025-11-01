"use client";

import { CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface UploadItem {
  filename: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface UploadProgressProps {
  uploads: UploadItem[];
  onClear?: () => void;
}

export function UploadProgress({ uploads, onClear }: UploadProgressProps) {
  if (uploads.length === 0) return null;

  const completedCount = uploads.filter((u) => u.status === "completed").length;
  const errorCount = uploads.filter((u) => u.status === "error").length;
  const uploadingCount = uploads.filter(
    (u) => u.status === "uploading" || u.status === "pending"
  ).length;

  // Auto-dismiss after 5 seconds when all uploads are complete
  useEffect(() => {
    if (uploadingCount === 0 && errorCount === 0 && onClear) {
      const timer = setTimeout(() => {
        onClear();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadingCount, errorCount, onClear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">
          Upload Progress ({completedCount}/{uploads.length})
        </CardTitle>
        {onClear && uploadingCount === 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="size-8"
          >
            <X className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {uploads.map((upload) => (
            <div key={upload.filename} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {upload.status === "completed" && (
                    <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  )}
                  {upload.status === "error" && (
                    <XCircle className="size-4 text-destructive shrink-0" />
                  )}
                  {(upload.status === "uploading" ||
                    upload.status === "pending") && (
                    <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                  )}
                  <span className="truncate font-medium">
                    {upload.filename}
                  </span>
                </div>
                <span className="text-muted-foreground ml-2">
                  {upload.progress.toFixed(0)}%
                </span>
              </div>
              <Progress value={upload.progress} className="h-1" />
              {upload.error && (
                <p className="text-xs text-destructive">{upload.error}</p>
              )}
            </div>
          ))}

          {uploadingCount === 0 && errorCount === 0 && (
            <div className="flex items-center justify-between pt-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-700 dark:text-green-400">
                All uploads completed! Videos will be processed in the background.
              </p>
            </div>
          )}
          {errorCount > 0 && uploadingCount === 0 && (
            <div className="flex items-center justify-between pt-2 px-3 py-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-700 dark:text-red-400">
                {errorCount} {errorCount === 1 ? "upload" : "uploads"} failed. Please try again.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
