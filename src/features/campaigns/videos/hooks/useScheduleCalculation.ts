import type { ScheduleData, SelectedVideo } from "../types/schedule.types";
import { createCyclicIterator, createDateIterator } from "./useScheduleIterators";
import { 
  createScheduledTracker, 
  updateScheduledTracker, 
  findBestVideoForScheduling, 
  getPlatformsToSchedule 
} from "./useScheduleTracker";
import { getSocialAccountIds, createScheduleData } from "./useScheduleGeneration";

interface Profile {
  profileKey: string;
  profileName: string;
  socialAccounts: { platform: string; _id: string }[];
}

interface UseScheduleCalculationProps {
  profilePlatforms: Record<string, string[]>;
  selectedTimeSlots: string[];
  startDate: Date;
  selectedVideos: SelectedVideo[];
  profiles: Profile[] | undefined;
  setEndDate: (date: Date) => void;
}

export function useScheduleCalculation({
  profilePlatforms,
  selectedTimeSlots,
  startDate,
  selectedVideos,
  profiles,
  setEndDate,
}: UseScheduleCalculationProps) {
  
  const getAllSelectedPlatforms = () => {
    const platforms = new Set<string>();
    Object.values(profilePlatforms).forEach(profilePlatforms => {
      profilePlatforms.forEach(platform => platforms.add(platform));
    });
    return Array.from(platforms);
  };

  const generateSchedules = (): ScheduleData[] => {
    const schedules: ScheduleData[] = [];
    const profileKeys = Object.keys(profilePlatforms);
    const uniquePlatforms = getAllSelectedPlatforms();

    // Create iterators for cycling through profiles, time slots, and dates
    const profileIterator = createCyclicIterator(profileKeys);
    const timeSlotIterator = createCyclicIterator(selectedTimeSlots);
    const dateIterator = createDateIterator(startDate);

    let currentDate = dateIterator.next().value;
    const scheduledTracker = createScheduledTracker();

    // Schedule videos until we run out
    let hasMoreVideos = true;
    while (hasMoreVideos) {
      for (let j = 0; j < selectedTimeSlots.length && hasMoreVideos; j++) {
        const currentTimeSlot = timeSlotIterator.next().value;
        
        if (!currentTimeSlot) {
          hasMoreVideos = false;
          break;
        }
        
        for (let i = 0; i < profileKeys.length && hasMoreVideos; i++) {
          const currentProfileKey = profileIterator.next().value;

          if (!currentProfileKey) {
            hasMoreVideos = false;
            break;
          }

          const video = findBestVideoForScheduling(selectedVideos, uniquePlatforms, scheduledTracker);
          
          if (!video) {
            hasMoreVideos = false;
            break;
          }

          const platformsToSchedule = getPlatformsToSchedule(profilePlatforms[currentProfileKey], video, scheduledTracker);
          
          if (platformsToSchedule.length > 0) {
            const socialAccountIds = getSocialAccountIds(profiles, currentProfileKey, platformsToSchedule);
            const scheduleData = createScheduleData(video, platformsToSchedule, currentTimeSlot, currentDate, currentProfileKey, socialAccountIds);
            
            if (scheduleData) {
              schedules.push(scheduleData);
              updateScheduledTracker(scheduledTracker, video, platformsToSchedule);
            }
          }
        }

        if (!hasMoreVideos) break;
      }
      if (!hasMoreVideos) break;
      currentDate = dateIterator.next().value;
    }

    setEndDate(currentDate);
    return schedules;
  };

  return {
    generateSchedules,
    getAllSelectedPlatforms,
  };
}