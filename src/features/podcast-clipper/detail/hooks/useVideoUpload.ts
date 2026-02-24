"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { PodcastFolderId } from "../../shared/types/podcast-clipper.types";

interface UploadState {
  status: "idle" | "uploading" | "creating" | "completed" | "error";
  progress: number;
  error?: string;
}

export function useVideoUpload() {
  const generateUploadUrl = useAction(api.app.podcastClipperS3.generatePodcastUploadUrl);
  const uploadVideoMutation = useMutation(api.app.podcastClipperDb.uploadVideo);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });

  const uploadVideo = useCallback(
    async (file: File, folderId: PodcastFolderId, videoName: string) => {
      try {
        setUploadState({ status: "uploading", progress: 0 });

        const { uploadUrl, fileUrl } = await generateUploadUrl({
          filename: file.name,
          contentType: file.type || "video/mp4",
        });

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = (e.loaded / e.total) * 100;
              setUploadState((prev) => ({ ...prev, progress }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
          xhr.send(file);
        });

        setUploadState({ status: "creating", progress: 100 });
        await uploadVideoMutation({
          folderId,
          videoName,
          inputVideoUrl: fileUrl,
        });

        setUploadState({ status: "completed", progress: 100 });
        toast.success(`${videoName} uploaded successfully`);
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setUploadState({ status: "error", progress: 0, error: errorMessage });
        toast.error(`Failed to upload: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    },
    [generateUploadUrl, uploadVideoMutation]
  );

  const resetUploadState = useCallback(() => {
    setUploadState({ status: "idle", progress: 0 });
  }, []);

  return {
    uploadVideo,
    uploadState,
    resetUploadState,
    isUploading: uploadState.status === "uploading" || uploadState.status === "creating",
  };
}
