"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useConvexUpload } from "@/hooks/useConvexUpload";

export function useCampaignLyrics(campaignId: string, srtUrl?: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [srtContent, setSrtContent] = useState<string | null>(null);
  const [isFetchingSrt, setIsFetchingSrt] = useState(false);

  const updateLyricsMutation = useMutation(api.app.campaignAssets.updateLyrics);
  const removeLyricsMutation = useMutation(api.app.campaignAssets.removeLyrics);
  const { uploadFile } = useConvexUpload();

  /**
   * Fetch raw SRT content from URL for display
   */
  const fetchSrtContent = useCallback(async (url: string) => {
    setIsFetchingSrt(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch SRT file");
      }
      const text = await response.text();
      setSrtContent(text);
    } catch (error) {
      console.error("Error fetching SRT content:", error);
      setSrtContent(null);
    } finally {
      setIsFetchingSrt(false);
    }
  }, []);

  // Fetch SRT content when URL changes
  useEffect(() => {
    if (srtUrl) {
      void fetchSrtContent(srtUrl);
    } else {
      setSrtContent(null);
    }
  }, [srtUrl, fetchSrtContent]);

  /**
   * Upload and save SRT file directly to database
   */
  const handleUploadSRT = async (file: File) => {
    setIsUploading(true);
    try {
      const text = await file.text();

      // Basic validation - check if file has content
      if (!text.trim()) {
        toast.error("Failed to parse SRT file", {
          description: "The file appears to be empty",
        });
        return;
      }

      // Upload the SRT file to storage
      const uploadResult = await uploadFile(file);
      if (!uploadResult) {
        toast.error("Failed to upload SRT file");
        return;
      }

      // Save to database
      await updateLyricsMutation({
        campaignId,
        srtFileId: uploadResult.storageId,
        srtUrl: uploadResult.publicUrl,
      });

      // Update local SRT content for immediate display
      setSrtContent(text);
      toast.success("SRT file uploaded successfully");
    } catch (error) {
      console.error("SRT upload error:", error);
      toast.error("Failed to upload SRT file", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Remove SRT data from campaign
   */
  const handleRemoveSRT = async () => {
    setIsRemoving(true);
    try {
      await removeLyricsMutation({ campaignId });
      setSrtContent(null);
      toast.success("SRT file removed successfully");
    } catch (error) {
      console.error("Remove SRT error:", error);
      toast.error("Failed to remove SRT file");
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    isUploading,
    isRemoving,
    srtContent,
    isFetchingSrt,
    handleUploadSRT,
    handleRemoveSRT,
  };
}
