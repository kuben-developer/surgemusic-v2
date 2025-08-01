import type { ScheduleData, SelectedVideo } from "../types/schedule.types";
import { TIME_SLOTS } from "../constants/platforms";

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

// Helper functions
function createCyclicIterator<T>(items: T[]) {
  return (function* () {
    let index = 0;
    while (true) {
      yield items[index % items.length];
      index++;
    }
  })();
}

function createDateIterator(startDate: Date) {
  return (function* () {
    let currentDate = new Date(startDate);
    while (true) {
      yield new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  })();
}

function createScheduledTracker() {
  return {
    tiktok: new Set<string>(),
    instagram: new Set<string>(),
    youtube: new Set<string>(),
  };
}

function findBestVideoForScheduling(
  selectedVideos: SelectedVideo[], 
  uniquePlatforms: string[], 
  scheduledTracker: ReturnType<typeof createScheduledTracker>
) {
  // First try to find a video that hasn't been scheduled on any platforms
  let video = selectedVideos.find(v => {
    return uniquePlatforms?.every(platform => {
      if (platform === "tiktok" && !scheduledTracker.tiktok.has(v.videoUrl)) return true;
      if (platform === "instagram" && !scheduledTracker.instagram.has(v.videoUrl)) return true;
      if (platform === "youtube" && !scheduledTracker.youtube.has(v.videoUrl)) return true;
      return false;
    });
  });

  // If no video found, try to find one that hasn't been scheduled on any 2 platforms
  if (!video) {
    video = selectedVideos.find(v => {
      const unscheduledCount = uniquePlatforms?.filter(platform => {
        if (platform === "tiktok" && !scheduledTracker.tiktok.has(v.videoUrl)) return true;
        if (platform === "instagram" && !scheduledTracker.instagram.has(v.videoUrl)) return true;
        if (platform === "youtube" && !scheduledTracker.youtube.has(v.videoUrl)) return true;
        return false;
      }).length || 0;

      return unscheduledCount >= 2;
    });
  }

  // If still no video found, find one that hasn't been scheduled on at least 1 platform
  if (!video) {
    video = selectedVideos.find(v => {
      return uniquePlatforms?.some(platform => {
        if (platform === "tiktok" && !scheduledTracker.tiktok.has(v.videoUrl)) return true;
        if (platform === "instagram" && !scheduledTracker.instagram.has(v.videoUrl)) return true;
        if (platform === "youtube" && !scheduledTracker.youtube.has(v.videoUrl)) return true;
        return false;
      });
    });
  }

  return video;
}

function getPlatformsToSchedule(
  profilePlatforms: string[] | undefined, 
  video: SelectedVideo, 
  scheduledTracker: ReturnType<typeof createScheduledTracker>
) {
  return profilePlatforms?.filter(platform => {
    switch (platform) {
      case "tiktok": return !scheduledTracker.tiktok.has(video.videoUrl);
      case "instagram": return !scheduledTracker.instagram.has(video.videoUrl);
      case "youtube": return !scheduledTracker.youtube.has(video.videoUrl);
      default: return false;
    }
  }) || [];
}

function getSocialAccountIds(
  profiles: any[] | undefined, 
  profileKey: string, 
  platformsToSchedule: string[]
) {
  const profileObj = profiles?.find(p => p.profileKey === profileKey);
  const socialAccountIds: Record<string, string> = {};

  if (profileObj && platformsToSchedule.length > 0) {
    platformsToSchedule.forEach(platform => {
      const socialAccount = profileObj.socialAccounts.find(
        (account: any) => account.platform.toLowerCase() === platform
      );
      if (socialAccount) {
        socialAccountIds[platform] = socialAccount._id.toString();
      }
    });
  }

  return socialAccountIds;
}

function createScheduleData(
  video: SelectedVideo,
  platformsToSchedule: string[],
  currentTimeSlot: string,
  currentDate: Date,
  profileKey: string,
  socialAccountIds: Record<string, string>
): ScheduleData | null {
  const timeSlot = TIME_SLOTS.find(slot => slot.id === currentTimeSlot);

  if (!timeSlot) return null;

  const scheduleDate = (() => {
    const scheduleDateObj = new Date(currentDate);
    scheduleDateObj.setHours(timeSlot.hour, 0, 0, 0);
    return scheduleDateObj.toISOString();
  })();
  
  // Skip scheduling if the date is in the past (with 10 minute buffer)
  const now = new Date();
  now.setMinutes(now.getMinutes() + 10);
  const scheduleDateObj = new Date(scheduleDate);
  if (scheduleDateObj < now) {
    console.log(`Skipping date too close to current time: ${scheduleDate}`);
    return null;
  }

  return {
    post: video.caption || "",
    platforms: platformsToSchedule,
    mediaUrls: [video.videoUrl],
    scheduleDate: scheduleDate,
    profileKey: profileKey,
    videoId: video.videoId,
    socialAccountIds: socialAccountIds
  };
}

function updateScheduledTracker(
  scheduledTracker: ReturnType<typeof createScheduledTracker>,
  video: SelectedVideo,
  platformsToSchedule: string[]
) {
  platformsToSchedule.forEach(platform => {
    switch (platform) {
      case "tiktok": scheduledTracker.tiktok.add(video.videoUrl); break;
      case "instagram": scheduledTracker.instagram.add(video.videoUrl); break;
      case "youtube": scheduledTracker.youtube.add(video.videoUrl); break;
    }
  });
}