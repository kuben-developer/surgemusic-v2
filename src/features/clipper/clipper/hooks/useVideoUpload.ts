"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UploadProgress {
  filename: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface UseVideoUploadOptions {
  onUploadComplete?: () => void;
}

export function useVideoUpload(folderName: string | null, options?: UseVideoUploadOptions) {
  const generateUploadUrlAction = useAction(api.app.clipper.generateUploadUrl);
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(
    new Map()
  );
  const [isUploading, setIsUploading] = useState(false);

  // Store the callback in a ref to avoid unnecessary re-renders
  const onUploadCompleteRef = useRef(options?.onUploadComplete);

  useEffect(() => {
    onUploadCompleteRef.current = options?.onUploadComplete;
  }, [options?.onUploadComplete]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!folderName) {
        toast.error("Please select a folder first");
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
          const { uploadUrl } = await generateUploadUrlAction({
            folderName,
            filename: file.name,
            contentType: file.type || "video/mp4",
          });

          console.log("Generated presigned URL:", uploadUrl);
          console.log("File type:", file.type);
          console.log("File size:", file.size);

          // Upload file to S3
          const xhr = new XMLHttpRequest();

          await new Promise<void>((resolve, reject) => {
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
                    });
                  }
                  return updated;
                });
                resolve();
              } else {
                reject(
                  new Error(`Upload failed with status ${xhr.status}`)
                );
              }
            });

            xhr.addEventListener("error", (e) => {
              console.error("XHR Error:", e);
              console.error("XHR Status:", xhr.status);
              console.error("XHR Response:", xhr.responseText);
              reject(new Error("Network error during upload"));
            });

            xhr.open("PUT", uploadUrl);
            // IMPORTANT: Content-Type must match what was signed in the presigned URL
            xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
            xhr.send(file);
          });

          toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
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
      toast.success("All uploads completed!");

      // Call the onUploadComplete callback if provided
      if (onUploadCompleteRef.current) {
        onUploadCompleteRef.current();
      }
    },
    [folderName, generateUploadUrlAction]
  );

  const clearUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    isUploading,
    uploadFiles,
    clearUploads,
  };
}
