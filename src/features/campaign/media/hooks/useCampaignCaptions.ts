"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useCampaignCaptions(campaignId: string) {
  const [isUploading, setIsUploading] = useState(false);

  // Fetch captions
  const captions = useQuery(api.app.captions.list, { campaignId });
  const captionCount = useQuery(api.app.captions.count, { campaignId });

  // Mutations
  const addCaptionMutation = useMutation(api.app.captions.add);
  const bulkAddMutation = useMutation(api.app.captions.bulkAdd);
  const removeCaptionMutation = useMutation(api.app.captions.remove);

  /**
   * Add a single caption manually
   */
  const addCaption = async (text: string) => {
    try {
      await addCaptionMutation({ campaignId, text });
      toast.success("Caption added successfully");
    } catch (error) {
      toast.error("Failed to add caption");
      throw error;
    }
  };

  /**
   * Parse and upload captions from a .txt file
   */
  const uploadCaptionFile = async (file: File) => {
    setIsUploading(true);
    try {
      // Read file content
      const text = await file.text();

      // Split by newlines and filter empty lines
      const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length === 0) {
        toast.error("File is empty or contains no valid captions");
        setIsUploading(false);
        return;
      }

      // Bulk insert
      const result = await bulkAddMutation({
        campaignId,
        captions: lines,
      });

      toast.success(`Added ${result.count} captions successfully`);
      return result;
    } catch (error) {
      toast.error("Failed to upload caption file");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Remove a caption
   */
  const removeCaption = async (captionId: Id<"captions">) => {
    try {
      await removeCaptionMutation({ id: captionId });
      toast.success("Caption removed successfully");
    } catch (error) {
      toast.error("Failed to remove caption");
      throw error;
    }
  };

  return {
    captions,
    captionCount: captionCount ?? 0,
    isLoading: captions === undefined,
    isUploading,
    addCaption,
    uploadCaptionFile,
    removeCaption,
  };
}
