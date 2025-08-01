import type { ScheduleData, SelectedVideo } from "../types/schedule.types";
import { TIME_SLOTS } from "../constants/platforms";

interface Profile {
  profileKey: string;
  profileName: string;
  socialAccounts: { platform: string; _id: string }[];
}

export function getSocialAccountIds(
  profiles: Profile[] | undefined, 
  profileKey: string, 
  platformsToSchedule: string[]
) {
  const profileObj = profiles?.find(p => p.profileKey === profileKey);
  const socialAccountIds: Record<string, string> = {};

  if (profileObj && platformsToSchedule.length > 0) {
    platformsToSchedule.forEach(platform => {
      const socialAccount = profileObj.socialAccounts.find(
        (account) => account.platform.toLowerCase() === platform
      );
      if (socialAccount) {
        socialAccountIds[platform] = socialAccount._id.toString();
      }
    });
  }

  return socialAccountIds;
}

export function createScheduleData(
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