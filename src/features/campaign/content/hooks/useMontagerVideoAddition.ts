"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { OverlayStyle } from "../constants/overlay-styles.constants";
import type { RenderType } from "../constants/render-types.constants";
import { validateVideoCount } from "../utils/video-selection.utils";
import type { MontagerFolder } from "../../shared/types/campaign.types";
import type { Id } from "../../../../../convex/_generated/dataModel";

export type DialogStep = "folder" | "overlay" | "renderType" | "confirm";

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
  const [selectedRenderType, setSelectedRenderType] = useState<RenderType>("Both");
  const [isLoading, setIsLoading] = useState(false);
  const [videosToAssign, setVideosToAssignState] = useState<number>(airtableRecordIds.length);

  const videosNeeded = airtableRecordIds.length;

  // Calculate max videos that can be assigned (limited by folder capacity and available slots)
  const maxVideosToAssign = selectedFolder
    ? Math.min(selectedFolder.videoCount, videosNeeded)
    : videosNeeded;

  // Use Convex query for folders (database-based, not S3)
  const folders = useQuery(api.app.montagerDb.getFolders);
  const assignVideos = useMutation(api.app.montagerDb.assignVideosToAirtable);

  // Setter with validation for videosToAssign
  const setVideosToAssign = (count: number) => {
    const validCount = Math.max(1, Math.min(count, maxVideosToAssign));
    setVideosToAssignState(validCount);
  };

  const openDialog = () => {
    setIsOpen(true);
    setCurrentStep("folder");
    setSelectedFolder(null);
    setSelectedStyle(null);
    setSelectedRenderType("Both");
    setVideosToAssignState(videosNeeded); // Reset to max on open
  };

  const closeDialog = () => {
    setIsOpen(false);
    setCurrentStep("folder");
    setSelectedFolder(null);
    setSelectedStyle(null);
    setSelectedRenderType("Both");
    setVideosToAssignState(videosNeeded); // Reset on close
  };

  const handleSelectFolder = async (folder: MontagerFolder) => {
    // Validate folder has at least 1 video
    if (folder.videoCount < 1) {
      toast.error("This folder has no videos available");
      return;
    }

    setSelectedFolder(folder);
    // Set videosToAssign to the max possible for this folder
    const newMax = Math.min(folder.videoCount, videosNeeded);
    setVideosToAssignState(newMax);
  };

  const handleNextStep = () => {
    if (currentStep === "folder" && selectedFolder) {
      setCurrentStep("overlay");
    } else if (currentStep === "overlay" && selectedStyle) {
      setCurrentStep("renderType");
    } else if (currentStep === "renderType" && selectedRenderType) {
      setCurrentStep("confirm");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "overlay") {
      setCurrentStep("folder");
    } else if (currentStep === "renderType") {
      setCurrentStep("overlay");
    } else if (currentStep === "confirm") {
      setCurrentStep("renderType");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFolder || !selectedStyle) {
      toast.error("Please complete all steps");
      return;
    }

    if (videosToAssign < 1) {
      toast.error("Please select at least 1 video to assign");
      return;
    }

    setIsLoading(true);

    try {
      // Only assign the selected number of videos
      const recordsToAssign = airtableRecordIds.slice(0, videosToAssign);

      // Assign videos from montager folder to airtable records
      const result = await assignVideos({
        folderId: selectedFolder._id as Id<"montagerFolders">,
        overlayStyle: selectedStyle,
        renderType: selectedRenderType,
        airtableRecordIds: recordsToAssign,
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
    selectedRenderType,
    isLoading,
    videosNeeded,
    videosToAssign,
    maxVideosToAssign,
    folders: folders ?? [],
    foldersLoading: folders === undefined,
    openDialog,
    closeDialog,
    setSelectedFolder: handleSelectFolder,
    setSelectedStyle,
    setSelectedRenderType,
    setVideosToAssign,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
  };
}
