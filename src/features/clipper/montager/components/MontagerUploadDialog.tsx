"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Loader2,
  Upload,
  Video,
  XCircle,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { useMontagerUpload } from "../hooks/useMontagerUpload";
import type { Id } from "../../../../../convex/_generated/dataModel";

function truncateFilename(filename: string, maxLength: number): string {
  if (filename.length <= maxLength) return filename;

  const ext = filename.lastIndexOf(".") > 0
    ? filename.slice(filename.lastIndexOf("."))
    : "";
  const nameWithoutExt = filename.slice(0, filename.length - ext.length);
  const truncatedLength = maxLength - ext.length - 3;

  if (truncatedLength <= 0) return filename.slice(0, maxLength - 3) + "...";

  return nameWithoutExt.slice(0, truncatedLength) + "..." + ext;
}

interface MontagerUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: Id<"montagerFolders">;
  onSuccess?: () => void;
}

export function MontagerUploadDialog({
  open,
  onOpenChange,
  folderId,
  onSuccess,
}: MontagerUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploads, isUploading, isCreating, uploadFiles, clearUploads } =
    useMontagerUpload({
      folderId,
      onUploadComplete: () => {
        onSuccess?.();
      },
    });

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        void uploadFiles(Array.from(files));
      }
    },
    [uploadFiles]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const videoFiles = Array.from(files).filter((file) =>
          file.type.startsWith("video/")
        );
        if (videoFiles.length > 0) {
          void uploadFiles(videoFiles);
        }
      }
    },
    [uploadFiles]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleClose = useCallback(() => {
    if (!isUploading && !isCreating) {
      onOpenChange(false);
      clearUploads();
    }
  }, [isUploading, isCreating, onOpenChange, clearUploads]);

  const hasUploads = uploads.length > 0;
  const allCompleted = uploads.length > 0 && uploads.every((u) => u.status === "completed");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Montages</DialogTitle>
          <DialogDescription>
            Upload video files directly to this folder. Videos will be available for assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop zone */}
          {!hasUploads && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                "hover:border-primary hover:bg-primary/5"
              )}
            >
              <Upload className="size-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drop video files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports MP4, MOV, MKV, AVI, WebM
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Upload progress list */}
          {hasUploads && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {uploads.map((upload) => (
                <div
                  key={upload.filename}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <Video className="size-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={upload.filename}>
                      {truncateFilename(upload.filename, 40)}
                    </p>
                    {upload.status === "uploading" && (
                      <Progress value={upload.progress} className="h-1.5 mt-1.5" />
                    )}
                    {upload.status === "error" && (
                      <p className="text-xs text-destructive mt-1">
                        {upload.error}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {upload.status === "pending" && (
                      <div className="size-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    {upload.status === "uploading" && (
                      <Loader2 className="size-5 animate-spin text-primary" />
                    )}
                    {upload.status === "completed" && (
                      <CheckCircle className="size-5 text-green-500" />
                    )}
                    {upload.status === "error" && (
                      <XCircle className="size-5 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Creating records status */}
          {isCreating && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>Saving videos to folder...</span>
            </div>
          )}

          {/* Success message */}
          {allCompleted && !isCreating && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-green-600">
              <CheckCircle className="size-4" />
              <span>Videos uploaded successfully!</span>
            </div>
          )}
        </div>

        <DialogFooter>
          {!hasUploads ? (
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4 mr-2" />
              Select Videos
            </Button>
          ) : (
            <Button
              variant={allCompleted ? "default" : "outline"}
              onClick={handleClose}
              disabled={isUploading || isCreating}
            >
              {allCompleted ? "Done" : "Close"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
