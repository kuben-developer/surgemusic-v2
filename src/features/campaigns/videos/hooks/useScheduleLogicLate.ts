import type { SelectedVideo, ScheduleDataLate } from "../types/schedule.types";
import { useScheduleState } from "./useScheduleState";
import { useScheduleCalculationLate } from "./useScheduleCalculationLate";
import { useScheduleSubmissionLate } from "./useScheduleSubmissionLate";

interface LateProfile {
  _id: string;
  profileName: string;
  lateProfileId: string;
  socialAccounts: { platform: string; _id: string; lateAccountId: string }[];
}

interface UseScheduleLogicLateProps {
  profilePlatforms: Record<string, string[]>;
  selectedTimeSlots: string[];
  startDate: Date;
  selectedVideos: SelectedVideo[];
  profiles: LateProfile[] | undefined;
  onScheduleComplete: () => void;
}

export function useScheduleLogicLate({
  profilePlatforms,
  selectedTimeSlots,
  startDate,
  selectedVideos,
  profiles,
  onScheduleComplete,
}: UseScheduleLogicLateProps) {
  // Use the state management hook
  const {
    schedules,
    setSchedules,
    endDate,
    setEndDate,
    isScheduling,
    setIsScheduling,
    schedulingProgress,
    setSchedulingProgress,
    showProgressModal,
    setShowProgressModal,
  } = useScheduleState<ScheduleDataLate>();

  // Use the calculation hook
  const { generateSchedules: calculateSchedules, getAllSelectedPlatforms } = useScheduleCalculationLate({
    profilePlatforms,
    selectedTimeSlots,
    startDate,
    selectedVideos,
    profiles,
    setEndDate,
  });

  // Use the submission hook
  const { batchSchedule } = useScheduleSubmissionLate({
    schedules,
    setIsScheduling,
    setSchedulingProgress,
    setShowProgressModal,
    onScheduleComplete,
  });

  const generateSchedules = () => {
    const newSchedules = calculateSchedules();
    setSchedules(newSchedules);
    console.log("Late schedules", newSchedules);
  };

  return {
    schedules,
    endDate,
    isScheduling,
    schedulingProgress,
    showProgressModal,
    setShowProgressModal,
    generateSchedules,
    batchSchedule,
    getAllSelectedPlatforms,
  };
}
