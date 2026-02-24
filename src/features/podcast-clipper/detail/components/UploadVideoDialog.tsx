"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2 } from "lucide-react";
import { useVideoUpload } from "../hooks/useVideoUpload";
import type { PodcastFolderId } from "../../shared/types/podcast-clipper.types";

interface UploadVideoDialogProps {
  folderId: PodcastFolderId;
}

export function UploadVideoDialog({ folderId }: UploadVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadVideo, uploadState, resetUploadState, isUploading } = useVideoUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const videoName = selectedFile.name.replace(/\.[^/.]+$/, "");
    const result = await uploadVideo(selectedFile, folderId, videoName);

    if (result.success) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setOpen(false);
      resetUploadState();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUploading) {
      setOpen(newOpen);
      if (!newOpen) {
        setSelectedFile(null);
        resetUploadState();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a landscape podcast video. Supported formats: MP4, MOV, MKV, AVI, WebM.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="videoFile">Video File</Label>
            <Input
              id="videoFile"
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-matroska,video/avi,video/webm,.mp4,.mov,.mkv,.avi,.webm"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadState.progress} />
              <p className="text-sm text-muted-foreground text-center">
                {uploadState.status === "uploading"
                  ? `Uploading... ${Math.round(uploadState.progress)}%`
                  : "Creating record..."}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
