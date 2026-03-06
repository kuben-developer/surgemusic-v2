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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, Link } from "lucide-react";
import { useVideoUpload } from "../hooks/useVideoUpload";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { PodcastFolderId } from "../../shared/types/podcast-clipper.types";

interface UploadVideoDialogProps {
  folderId: PodcastFolderId;
}

export function UploadVideoDialog({ folderId }: UploadVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadVideo, uploadState, resetUploadState, isUploading } = useVideoUpload();
  const uploadFromUrl = useMutation(api.app.podcastClipperDb.uploadVideoFromUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleFileUpload = async () => {
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

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) return;
    setIsSubmitting(true);
    try {
      await uploadFromUrl({ folderId, youtubeUrl: youtubeUrl.trim() });
      toast.success("Download started");
      setYoutubeUrl("");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start download");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUploading && !isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        setSelectedFile(null);
        setYoutubeUrl("");
        resetUploadState();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
          <DialogDescription>
            Paste a YouTube URL to download, or upload a file directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="youtube" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="youtube" className="flex-1">
              <Link className="h-3.5 w-3.5 mr-1.5" />
              YouTube URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="youtube" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleYoutubeSubmit} disabled={!youtubeUrl.trim() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Download"
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
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
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
