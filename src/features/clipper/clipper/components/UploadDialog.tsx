"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoUploader } from "./VideoUploader";
import { UploadProgress } from "./UploadProgress";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesSelected: (files: File[]) => void;
  uploads: Array<{
    filename: string;
    progress: number;
    status: "pending" | "uploading" | "completed" | "error";
    error?: string;
  }>;
  isUploading: boolean;
  onClearUploads: () => void;
}

export function UploadDialog({
  open,
  onOpenChange,
  onFilesSelected,
  uploads,
  isUploading,
  onClearUploads,
}: UploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Videos</DialogTitle>
          <DialogDescription>
            Upload videos to be automatically split into 1-second clips with quality metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <VideoUploader
            onFilesSelected={onFilesSelected}
            disabled={isUploading}
          />

          {uploads.length > 0 && (
            <UploadProgress uploads={uploads} onClear={onClearUploads} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
