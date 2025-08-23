"use client"

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { convertVideoToAudio, needsVideoToAudioConversion } from "@/utils/media-converter.utils";

interface UploadResult {
  storageId: Id<"_storage">;
  publicUrl: string;
}

interface UseConvexUploadOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  fileType?: "audio" | "image" | "video";
  trackUpload?: boolean; // Whether to save file metadata to tracking table
}

export function useConvexUpload(options: UseConvexUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useMutation(api.app.files.generateUploadUrl);
  const getFileUrl = useMutation(api.app.files.getFileUrl);
  const saveFileRecord = useMutation(api.app.files.saveFileRecord);

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Check if we need to convert video to audio
      let fileToUpload = file;
      if (needsVideoToAudioConversion(file, options.fileType)) {
        setUploadProgress(10);
        toast.info("Converting video to audio...");
        
        try {
          const convertedFile = await convertVideoToAudio(file);
          fileToUpload = convertedFile;
          setUploadProgress(20);
          toast.success("Video converted to audio successfully");
        } catch (conversionError) {
          console.error("Conversion failed:", conversionError);
          toast.error("Failed to convert video to audio");
          throw conversionError;
        }
      }

      // Step 1: Generate an upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Step 2: Upload the file to the URL
      setUploadProgress(30);
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": fileToUpload.type || "application/octet-stream",
        },
        body: fileToUpload,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      setUploadProgress(60);

      // Step 3: Get the storage ID from the response
      const { storageId } = await response.json() as { storageId: Id<"_storage"> };

      // Step 4: Get the public URL for the file
      setUploadProgress(80);
      const publicUrl = await getFileUrl({ storageId });

      // Step 5: Optionally save file metadata to tracking table
      if (options.trackUpload && options.fileType) {
        await saveFileRecord({
          storageId,
          filename: fileToUpload.name,
          contentType: fileToUpload.type,
          size: fileToUpload.size,
          fileType: options.fileType,
          publicUrl,
        });
      }

      setUploadProgress(100);

      const result: UploadResult = {
        storageId,
        publicUrl,
      };

      options.onSuccess?.(result);
      return result;
    } catch (error) {
      console.error("Upload failed:", error);
      const err = error instanceof Error ? error : new Error("Upload failed");
      options.onError?.(err);
      toast.error(err.message);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Helper function to convert file to base64 for preview
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    uploadFile,
    fileToBase64,
    isUploading,
    uploadProgress,
  };
}