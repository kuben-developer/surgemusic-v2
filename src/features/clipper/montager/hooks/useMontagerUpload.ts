"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface UploadProgress {
  filename: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  videoUrl?: string;
}

interface UseMontagerUploadOptions {
  folderId: Id<"montagerFolders">;
  onUploadComplete?: () => void;
}

export function useMontagerUpload(options: UseMontagerUploadOptions) {
  const { folderId, onUploadComplete } = options;

  const generateUploadUrl = useAction(api.app.directUploadS3.generateDirectUploadUrl);
  const uploadVideosMutation = useMutation(api.app.montagerDb.uploadVideosToFolder);

  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const onUploadCompleteRef = useRef(onUploadComplete);

  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
  }, [onUploadComplete]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        toast.error("No files selected");
        return;
      }

      setIsUploading(true);

      // Initialize upload tracking
      const newUploads = new Map<string, UploadProgress>();
      files.forEach((file) => {
        newUploads.set(file.name, {
          filename: file.name,
          progress: 0,
          status: "pending",
        });
      });
      setUploads(newUploads);

      const uploadedUrls: string[] = [];

      // Upload files one by one
      for (const file of files) {
        try {
          // Update status to uploading
          setUploads((prev) => {
            const updated = new Map(prev);
            const current = updated.get(file.name);
            if (current) {
              updated.set(file.name, { ...current, status: "uploading" });
            }
            return updated;
          });

          // Get presigned upload URL
          const { uploadUrl, videoUrl } = await generateUploadUrl({
            filename: file.name,
            contentType: file.type || "video/mp4",
          });

          // Upload file to S3
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                setUploads((prev) => {
                  const updated = new Map(prev);
                  const current = updated.get(file.name);
                  if (current) {
                    updated.set(file.name, { ...current, progress });
                  }
                  return updated;
                });
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setUploads((prev) => {
                  const updated = new Map(prev);
                  const current = updated.get(file.name);
                  if (current) {
                    updated.set(file.name, {
                      ...current,
                      progress: 100,
                      status: "completed",
                      videoUrl,
                    });
                  }
                  return updated;
                });
                uploadedUrls.push(videoUrl);
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
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Upload failed";
          setUploads((prev) => {
            const updated = new Map(prev);
            const current = updated.get(file.name);
            if (current) {
              updated.set(file.name, {
                ...current,
                status: "error",
                error: errorMessage,
              });
            }
            return updated;
          });
          toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }

      setIsUploading(false);

      // Create database records for all uploaded videos
      if (uploadedUrls.length > 0) {
        setIsCreating(true);
        try {
          const result = await uploadVideosMutation({
            folderId,
            videoUrls: uploadedUrls,
          });

          toast.success(`${result.count} montage${result.count !== 1 ? "s" : ""} uploaded`);

          if (onUploadCompleteRef.current) {
            onUploadCompleteRef.current();
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to save videos";
          toast.error(errorMessage);
        } finally {
          setIsCreating(false);
        }
      }
    },
    [folderId, generateUploadUrl, uploadVideosMutation]
  );

  const clearUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    isUploading,
    isCreating,
    uploadFiles,
    clearUploads,
  };
}
