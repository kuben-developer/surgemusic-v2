"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
import { Upload, Loader2, X, Video } from "lucide-react";
import { useVideoUpload } from "../hooks/useVideoUpload";
import { sanitizeInputVideoName } from "../utils/sanitize.utils";
import type { FolderId } from "../types/clipper.types";

interface UploadVideoDialogProps {
  folderId: FolderId;
}

export function UploadVideoDialog({ folderId }: UploadVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputVideoName, setInputVideoName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadVideo, uploadState, resetUploadState, isUploading } = useVideoUpload();

  // Auto-fill input name from filename
  useEffect(() => {
    if (selectedFile) {
      // Remove extension for the default name
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setInputVideoName(nameWithoutExt);
    }
  }, [selectedFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && isVideoFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setInputVideoName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !inputVideoName.trim()) {
      return;
    }

    const result = await uploadVideo(selectedFile, folderId, inputVideoName.trim());

    if (result.success) {
      handleClearFile();
      setOpen(false);
      resetUploadState();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUploading) {
      setOpen(newOpen);
      if (!newOpen) {
        handleClearFile();
        resetUploadState();
      }
    }
  };

  const isVideoFile = (file: File) => {
    const validExtensions = [".mp4", ".mov", ".mkv", ".avi", ".webm"];
    return validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Select a video file to upload. It will be processed automatically to generate clips.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* File selection area */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-colors hover:border-primary
                ${selectedFile ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              `}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.mov,.mkv,.avi,.webm"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Video className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium truncate max-w-[300px]">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearFile();
                    }}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop a video here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: MP4, MOV, MKV, AVI, WebM
                  </p>
                </>
              )}
            </div>

            {/* Video name input */}
            {selectedFile && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="videoName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="videoName"
                    value={inputVideoName}
                    onChange={(e) => setInputVideoName(e.target.value)}
                    placeholder="Enter video name"
                    className="col-span-3"
                    disabled={isUploading}
                  />
                </div>
                {inputVideoName.trim() && (
                  <div className="text-xs text-muted-foreground pl-[calc(25%+1rem)]">
                    URL path: <code className="bg-muted px-1 py-0.5 rounded">/clipper/{folderId}/{sanitizeInputVideoName(inputVideoName)}</code>
                  </div>
                )}
              </div>
            )}

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {uploadState.status === "uploading" ? "Uploading..." : "Creating record..."}
                  </span>
                  <span className="font-medium">{Math.round(uploadState.progress)}%</span>
                </div>
                <Progress value={uploadState.progress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !inputVideoName.trim()}
            >
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
