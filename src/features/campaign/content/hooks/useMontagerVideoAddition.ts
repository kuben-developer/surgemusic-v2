"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { OverlayStyle } from "../constants/overlay-styles.constants";
import {
  selectRandomVideos,
  validateVideoCount,
} from "../utils/video-selection.utils";
import type { MontagerFolder } from "../../shared/types/campaign.types";

export type DialogStep = "folder" | "overlay" | "confirm";

interface UseMontagerVideoAdditionProps {
  campaignId: string;
  categoryName: string;
  nicheName: string;
  videosNeeded: number;
  onSuccess?: () => void;
}

export function useMontagerVideoAddition({
  campaignId,
  categoryName,
  nicheName,
  videosNeeded,
  onSuccess,
}: UseMontagerVideoAdditionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<DialogStep>("folder");
  const [selectedFolder, setSelectedFolder] = useState<MontagerFolder | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<OverlayStyle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Convex actions and mutations
  const listFolders = useAction(api.app.montager.listMontagerFolders);
  const getVideos = useAction(api.app.montager.getMontagerVideos);
  const addVideos = useMutation(api.app.generatedVideos.addMontagerVideosToGenerated);

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
    const validation = validateVideoCount(folder.montageCount, videosNeeded);

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

    setIsLoading(true);

    try {
      // 1. Get all videos from the selected folder
      const allVideos = await getVideos({ folderName: selectedFolder.name });

      // 2. Randomly select required number of videos
      const selectedVideos = selectRandomVideos(allVideos, videosNeeded);

      if (selectedVideos.length < videosNeeded) {
        toast.error(`Only ${selectedVideos.length} videos available, but ${videosNeeded} needed`);
        setIsLoading(false);
        return;
      }

      // 3. Add videos to generatedVideos table
      const result = await addVideos({
        campaignId,
        categoryName,
        nicheName,
        overlayStyle: selectedStyle,
        videos: selectedVideos.map((v) => ({
          key: v.key,
          url: v.url,
          filename: v.filename,
        })),
      });

      if (result.success) {
        toast.success(`Successfully added ${result.count} videos from montager`);
        closeDialog();
        onSuccess?.();
      } else {
        toast.error("Failed to add videos");
      }
    } catch (error) {
      console.error("Error adding montager videos:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add videos");
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
    openDialog,
    closeDialog,
    setSelectedFolder: handleSelectFolder,
    setSelectedStyle,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    listFolders,
  };
}
