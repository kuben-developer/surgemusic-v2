"use client";

import { ProfilesStep } from "./ProfilesStep";
import { DateStep } from "./DateStep";  
import { TimeStep } from "./TimeStep";
import { ReviewStep } from "./ReviewStep";
import type { Step, SelectedVideo } from "../types/schedule.types";

interface Profile {
  profileKey: string;
  profileName: string;
  socialAccounts: { platform: string; _id: string }[];
}

interface ScheduleDialogContentProps {
  currentStep: Step;
  selectedVideosCount: number;
  selectedVideos: SelectedVideo[];
  
  // Profiles step props
  profiles: Profile[] | undefined;
  isLoadingProfiles: boolean;
  profilePlatforms: Record<string, string[]>;
  lastSelectedProfileIndex: number | null;
  onToggleProfilePlatform: (profileId: string, platformId: string) => void;
  onHandleProfileClick: (profileIndex: number, profileKey: string, platformId: string, event: React.MouseEvent) => void;
  onSelectAllForPlatform: (platformId: string) => void;
  onUnselectAllForPlatform: (platformId: string) => void;
  getSelectedProfiles: () => string[];
  isAnyProfileSelectedForPlatform: (platformId: string) => boolean;
  areAllProfilesSelectedForPlatform: (platformId: string) => boolean;
  
  // Date step props
  startDate: Date;
  onStartDateChange: (date: Date | undefined) => void;
  
  // Time step props
  selectedTimeSlots: string[];
  onToggleTimeSlot: (slotId: string) => void;
  
  // Review step props
  endDate: Date;
}

export function ScheduleDialogContent({
  currentStep,
  selectedVideosCount,
  selectedVideos,
  profiles,
  isLoadingProfiles,
  profilePlatforms,
  lastSelectedProfileIndex,
  onToggleProfilePlatform,
  onHandleProfileClick,
  onSelectAllForPlatform,
  onUnselectAllForPlatform,
  getSelectedProfiles,
  isAnyProfileSelectedForPlatform,
  areAllProfilesSelectedForPlatform,
  startDate,
  onStartDateChange,
  selectedTimeSlots,
  onToggleTimeSlot,
  endDate,
}: ScheduleDialogContentProps) {
  switch (currentStep) {
    case "profiles":
      return (
        <ProfilesStep
          profiles={profiles}
          isLoadingProfiles={isLoadingProfiles}
          profilePlatforms={profilePlatforms}
          lastSelectedProfileIndex={lastSelectedProfileIndex}
          onToggleProfilePlatform={onToggleProfilePlatform}
          onHandleProfileClick={onHandleProfileClick}
          onSelectAllForPlatform={onSelectAllForPlatform}
          onUnselectAllForPlatform={onUnselectAllForPlatform}
          getSelectedProfiles={getSelectedProfiles}
          isAnyProfileSelectedForPlatform={isAnyProfileSelectedForPlatform}
          areAllProfilesSelectedForPlatform={areAllProfilesSelectedForPlatform}
        />
      );

    case "date":
      return (
        <DateStep
          startDate={startDate}
          onStartDateChange={onStartDateChange}
        />
      );

    case "time":
      return (
        <TimeStep
          selectedTimeSlots={selectedTimeSlots}
          onToggleTimeSlot={onToggleTimeSlot}
        />
      );

    case "review":
      return (
        <ReviewStep
          selectedVideosCount={selectedVideosCount}
          selectedTimeSlots={selectedTimeSlots}
          startDate={startDate}
          endDate={endDate}
          profiles={profiles}
          profilePlatforms={profilePlatforms}
          getSelectedProfiles={getSelectedProfiles}
        />
      );

    default:
      return null;
  }
}