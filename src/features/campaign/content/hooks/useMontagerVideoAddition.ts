"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { OverlayStyle } from "../constants/overlay-styles.constants";
import { validateVideoCount } from "../utils/video-selection.utils";
import type { MontagerFolder } from "../../shared/types/campaign.types";
import type { Id } from "../../../../../convex/_generated/dataModel";

export type DialogStep = "folder" | "overlay" | "confirm";

interface UseMontagerVideoAdditionProps {
  airtableRecordIds: string[];
  campaignId: string;
  onSuccess?: () => void;
}

export function useMontagerVideoAddition({
  airtableRecordIds,
  campaignId,
  onSuccess,
}: UseMontagerVideoAdditionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<DialogStep>("folder");
  const [selectedFolder, setSelectedFolder] = useState<MontagerFolder | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<OverlayStyle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videosNeeded = airtableRecordIds.length;

  // Use Convex query for folders (database-based, not S3)
  const folders = useQuery(api.app.montagerDb.getFolders);
  const assignVideos = useMutation(api.app.montagerDb.assignVideosToAirtable);

  const openDialog = () => {
    setIsOpen(true);
    setCurrentStep("folder");
    setSelectedFolder(null);
    setSelectedStyle(null);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setCurrentStep("folder");
    setSelectedFolder(null);
    setSelectedStyle(null);
  };

  const handleSelectFolder = async (folder: MontagerFolder) => {
    // Validate folder has enough videos
    const validation = validateVideoCount(folder.videoCount, videosNeeded);

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    setSelectedFolder(folder);
  };

  const handleNextStep = () => {
    if (currentStep === "folder" && selectedFolder) {
      setCurrentStep("overlay");
    } else if (currentStep === "overlay" && selectedStyle) {
      setCurrentStep("confirm");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "overlay") {
      setCurrentStep("folder");
    } else if (currentStep === "confirm") {
      setCurrentStep("overlay");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFolder || !selectedStyle) {
      toast.error("Please complete all steps");
      return;
    }

    if (airtableRecordIds.length === 0) {
      toast.error("No videos to assign");
      return;
    }

    setIsLoading(true);

    try {
      // Assign videos from montager folder to airtable records
      const result = await assignVideos({
        folderId: selectedFolder._id as Id<"montagerFolders">,
        overlayStyle: selectedStyle,
        airtableRecordIds,
        campaignId,
      });

      if (result.success) {
        toast.success(`Successfully assigned ${result.count} videos for processing`);
        closeDialog();
        onSuccess?.();
      } else {
        toast.error("Failed to assign videos");
      }
    } catch (error) {
      console.error("Error assigning montager videos:", error);
      toast.error(error instanceof Error ? error.message : "Failed to assign videos");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    currentStep,
    selectedFolder,
    selectedStyle,
    isLoading,
    videosNeeded,
    folders: folders ?? [],
    foldersLoading: folders === undefined,
    openDialog,
    closeDialog,
    setSelectedFolder: handleSelectFolder,
    setSelectedStyle,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
  };
}
