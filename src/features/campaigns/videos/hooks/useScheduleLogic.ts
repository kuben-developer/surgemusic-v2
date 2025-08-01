import type { SelectedVideo } from "../types/schedule.types";
import { useScheduleState } from "./useScheduleState";
import { useScheduleCalculation } from "./useScheduleCalculation";
import { useScheduleSubmission } from "./useScheduleSubmission";

interface Profile {
  profileKey: string;
  profileName: string;
  socialAccounts: { platform: string; _id: string }[];
}

interface UseScheduleLogicProps {
  profilePlatforms: Record<string, string[]>;
  selectedTimeSlots: string[];
  startDate: Date;
  selectedVideos: SelectedVideo[];
  profiles: Profile[] | undefined;
  onScheduleComplete: () => void;
}

export function useScheduleLogic({
  profilePlatforms,
  selectedTimeSlots,
  startDate,
  selectedVideos,
  profiles,
  onScheduleComplete,
}: UseScheduleLogicProps) {
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
  } = useScheduleState();

  // Use the calculation hook
  const { generateSchedules: calculateSchedules, getAllSelectedPlatforms } = useScheduleCalculation({
    profilePlatforms,
    selectedTimeSlots,
    startDate,
    selectedVideos,
    profiles,
    setEndDate,
  });

  // Use the submission hook
  const { batchSchedule } = useScheduleSubmission({
    schedules,
    setIsScheduling,
    setSchedulingProgress,
    setShowProgressModal,
    onScheduleComplete,
  });

  const generateSchedules = () => {
    const newSchedules = calculateSchedules();
    setSchedules(newSchedules);
    console.log("schedules", newSchedules);
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