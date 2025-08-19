"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { StepIndicator } from "../components/StepIndicator";
import { ScheduleDialogContent } from "../components/ScheduleDialogContent";
import { ScheduleDialogNavigation } from "../components/ScheduleDialogNavigation";
import { ProgressModal } from "../components/ProgressModal";
import { useProfileSelection } from "../hooks/useProfileSelection";
import { useScheduleLogic } from "../hooks/useScheduleLogic";
import { useScheduleDialogState } from "../hooks/useScheduleDialogState";
import { validateStep } from "../utils/schedule-validation.utils";
import type { SelectedVideo } from "../types/schedule.types";

interface ScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVideosCount: number;
  selectedVideos: SelectedVideo[];
}

export function ScheduleDialog({ 
  isOpen, 
  onOpenChange, 
  selectedVideosCount, 
  selectedVideos 
}: ScheduleDialogProps) {
  // Fetch profiles from the API
  const profiles = useQuery(api.app.ayrshare.getProfiles);
  const isLoadingProfiles = profiles === undefined;

  // Dialog state management
  const dialogState = useScheduleDialogState({ onOpenChange });

  // Custom hooks for managing profile selection and scheduling logic
  const profileSelection = useProfileSelection({ profiles });
  const scheduleLogic = useScheduleLogic({
    profilePlatforms: profileSelection.profilePlatforms,
    selectedTimeSlots: dialogState.selectedTimeSlots,
    startDate: dialogState.startDate,
    selectedVideos,
    profiles,
    onScheduleComplete: () => onOpenChange(false)
  });

  // Validation
  const isStepValid = validateStep({
    currentStep: dialogState.currentStep,
    selectedProfilesCount: profileSelection.getSelectedProfiles().length,
    selectedTimeSlotsCount: dialogState.selectedTimeSlots.length,
  });

  // Enhanced navigation handlers
  const handleGoToNextStep = () => {
    if (dialogState.currentStep === "time") {
      scheduleLogic.generateSchedules();
    }
    dialogState.goToNextStep();
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      dialogState.setStartDate(date);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Schedule {selectedVideosCount} posts
            </DialogTitle>
            <DialogDescription>
              Configure your posting schedule and preferences
            </DialogDescription>
          </DialogHeader>

          <StepIndicator currentStep={dialogState.currentStep} />
          
          <ScheduleDialogContent
            currentStep={dialogState.currentStep}
            selectedVideosCount={selectedVideosCount}
            selectedVideos={selectedVideos}
            profiles={profiles}
            isLoadingProfiles={isLoadingProfiles}
            profilePlatforms={profileSelection.profilePlatforms}
            lastSelectedProfileIndex={profileSelection.lastSelectedProfileIndex}
            onToggleProfilePlatform={profileSelection.toggleProfilePlatform}
            onHandleProfileClick={profileSelection.handleProfileClick}
            onSelectAllForPlatform={profileSelection.selectAllForPlatform}
            onUnselectAllForPlatform={profileSelection.unselectAllForPlatform}
            getSelectedProfiles={profileSelection.getSelectedProfiles}
            isAnyProfileSelectedForPlatform={profileSelection.isAnyProfileSelectedForPlatform}
            areAllProfilesSelectedForPlatform={profileSelection.areAllProfilesSelectedForPlatform}
            startDate={dialogState.startDate}
            onStartDateChange={handleStartDateChange}
            selectedTimeSlots={dialogState.selectedTimeSlots}
            onToggleTimeSlot={dialogState.toggleTimeSlot}
            endDate={scheduleLogic.endDate}
          />

          <ScheduleDialogNavigation
            currentStep={dialogState.currentStep}
            isStepValid={isStepValid}
            isScheduling={scheduleLogic.isScheduling}
            selectedVideosCount={selectedVideosCount}
            onCancel={dialogState.handleCancel}
            onGoToPrevStep={dialogState.goToPrevStep}
            onGoToNextStep={handleGoToNextStep}
            onSchedule={scheduleLogic.batchSchedule}
          />
        </DialogContent>
      </Dialog>

      <ProgressModal
        isOpen={scheduleLogic.showProgressModal}
        onOpenChange={(open) => {
          // Only allow closing if not in progress
          if (!scheduleLogic.schedulingProgress.inProgress) {
            scheduleLogic.setShowProgressModal(open);
          }
        }}
        progress={scheduleLogic.schedulingProgress}
      />
    </>
  );
} 