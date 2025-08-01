import type { SelectedVideo } from "../types/schedule.types";

export interface ScheduledTracker {
  tiktok: Set<string>;
  instagram: Set<string>;
  youtube: Set<string>;
}

export function createScheduledTracker(): ScheduledTracker {
  return {
    tiktok: new Set<string>(),
    instagram: new Set<string>(),
    youtube: new Set<string>(),
  };
}

export function updateScheduledTracker(
  scheduledTracker: ScheduledTracker,
  video: SelectedVideo,
  platformsToSchedule: string[]
) {
  platformsToSchedule.forEach(platform => {
    switch (platform) {
      case "tiktok": 
        scheduledTracker.tiktok.add(video.videoUrl); 
        break;
      case "instagram": 
        scheduledTracker.instagram.add(video.videoUrl); 
        break;
      case "youtube": 
        scheduledTracker.youtube.add(video.videoUrl); 
        break;
    }
  });
}

export function findBestVideoForScheduling(
  selectedVideos: SelectedVideo[], 
  uniquePlatforms: string[], 
  scheduledTracker: ScheduledTracker
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

export function getPlatformsToSchedule(
  profilePlatforms: string[] | undefined, 
  video: SelectedVideo, 
  scheduledTracker: ScheduledTracker
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