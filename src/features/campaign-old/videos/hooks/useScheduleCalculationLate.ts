import type { ScheduleDataLate, SelectedVideo } from "../types/schedule.types";
import { createCyclicIterator, createDateIterator } from "../utils/schedule-iterators.utils";
import {
  createScheduledTracker,
  updateScheduledTracker,
  findBestVideoForScheduling,
  getPlatformsToSchedule
} from "../utils/schedule-tracker.utils";

interface LateProfile {
  _id: string;
  profileName: string;
  lateProfileId: string;
  socialAccounts: { platform: string; _id: string; lateAccountId: string }[];
}

interface UseScheduleCalculationLateProps {
  profilePlatforms: Record<string, string[]>;
  selectedTimeSlots: string[];
  startDate: Date;
  selectedVideos: SelectedVideo[];
  profiles: LateProfile[] | undefined;
  setEndDate: (date: Date) => void;
}

export function useScheduleCalculationLate({
  profilePlatforms,
  selectedTimeSlots,
  startDate,
  selectedVideos,
  profiles,
  setEndDate,
}: UseScheduleCalculationLateProps) {

  const getAllSelectedPlatforms = () => {
    const platforms = new Set<string>();
    Object.values(profilePlatforms).forEach(profilePlatforms => {
      profilePlatforms.forEach(platform => platforms.add(platform));
    });
    return Array.from(platforms);
  };

  const getSocialAccountIds = (
    profiles: LateProfile[] | undefined,
    profileId: string,
    platforms: string[]
  ): Record<string, string> => {
    if (!profiles) return {};

    const profile = profiles.find((p) => p._id === profileId);
    if (!profile) return {};

    const accountIds: Record<string, string> = {};
    platforms.forEach((platform) => {
      const account = profile.socialAccounts.find((acc) => acc.platform === platform);
      if (account) {
        accountIds[platform] = account._id;
      }
    });

    return accountIds;
  };

  const createScheduleDataLate = (
    video: SelectedVideo,
    platforms: string[],
    timeSlot: string,
    date: Date,
    profileId: string,
    socialAccountIds: Record<string, string>,
    lateProfileId: string
  ): ScheduleDataLate | null => {
    const [hourStr, minuteStr] = timeSlot.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) {
      console.error(`Invalid time slot: ${timeSlot}`);
      return null;
    }

    const scheduleDate = new Date(date);
    scheduleDate.setHours(hour, minute, 0, 0);

    // Get social account Late IDs for the platforms
    const profile = profiles?.find((p) => p._id === profileId);
    if (!profile) return null;

    const platformsArray = platforms.map((platform) => {
      const account = profile.socialAccounts.find((acc) => acc.platform === platform);
      return {
        platform: platform,
        accountId: account?.lateAccountId || "",
      };
    }).filter(p => p.accountId !== "");

    if (platformsArray.length === 0) return null;

    return {
      content: video.caption,
      platforms: platformsArray,
      mediaItems: [
        {
          type: "video",
          url: video.videoUrl,
        },
      ],
      scheduleDate: scheduleDate.toISOString(),
      lateProfileId: lateProfileId,
      videoId: video.videoId,
      socialAccountIds,
    };
  };

  const generateSchedules = (): ScheduleDataLate[] => {
    const schedules: ScheduleDataLate[] = [];
    const profileIds = Object.keys(profilePlatforms);
    const uniquePlatforms = getAllSelectedPlatforms();

    // Create iterators for cycling through profiles, time slots, and dates
    const profileIterator = createCyclicIterator(profileIds);
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

        for (let i = 0; i < profileIds.length && hasMoreVideos; i++) {
          const currentProfileId = profileIterator.next().value;

          if (!currentProfileId) {
            hasMoreVideos = false;
            break;
          }

          const video = findBestVideoForScheduling(selectedVideos, uniquePlatforms, scheduledTracker);

          if (!video) {
            hasMoreVideos = false;
            break;
          }

          const platformsToSchedule = getPlatformsToSchedule(profilePlatforms[currentProfileId], video, scheduledTracker);

          if (platformsToSchedule.length > 0) {
            const profile = profiles?.find((p) => p._id === currentProfileId);
            if (!profile) continue;

            const socialAccountIds = getSocialAccountIds(profiles, currentProfileId, platformsToSchedule);
            const scheduleData = createScheduleDataLate(
              video,
              platformsToSchedule,
              currentTimeSlot,
              currentDate,
              currentProfileId,
              socialAccountIds,
              profile.lateProfileId
            );

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
