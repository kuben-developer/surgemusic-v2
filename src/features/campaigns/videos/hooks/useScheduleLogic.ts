import { useState } from "react";
import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import type { ScheduleData, SelectedVideo, SchedulingProgress } from "../types/schedule.types";
import { TIME_SLOTS } from "../constants/platforms";

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
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedulingProgress, setSchedulingProgress] = useState<SchedulingProgress>({
    total: 0,
    completed: 0,
    inProgress: false
  });
  const [showProgressModal, setShowProgressModal] = useState(false);

  const schedulePost = useAction(api.ayrshare.schedulePost);

  const getAllSelectedPlatforms = () => {
    const platforms = new Set<string>();
    Object.values(profilePlatforms).forEach(profilePlatforms => {
      profilePlatforms.forEach(platform => platforms.add(platform));
    });
    return Array.from(platforms);
  };

  const generateSchedules = () => {
    const schedules: ScheduleData[] = [];
    const profileKeys = Object.keys(profilePlatforms);
    const uniquePlatforms = getAllSelectedPlatforms();

    const profileIterator = (function* () {
      let index = 0;
      while (true) {
        yield profileKeys[index % profileKeys.length];
        index++;
      }
    })();

    const timeSlotIterator = (function* () {
      let index = 0;
      while (true) {
        yield selectedTimeSlots[index % selectedTimeSlots.length];
        index++;
      }
    })();

    const dateIterator = (function* () {
      let currentDate = new Date(startDate);
      while (true) {
        yield new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    })();

    let currentDate = dateIterator.next().value;
    const scheduledOnTikTok = new Set<string>();
    const scheduledOnInstagram = new Set<string>();
    const scheduledOnYouTube = new Set<string>();

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

          // First try to find a video that hasn't been scheduled on any platforms
          let video = selectedVideos.find(v => {
            return uniquePlatforms?.every(platform => {
              if (platform === "tiktok" && !scheduledOnTikTok.has(v.videoUrl)) return true;
              if (platform === "instagram" && !scheduledOnInstagram.has(v.videoUrl)) return true;
              if (platform === "youtube" && !scheduledOnYouTube.has(v.videoUrl)) return true;
              return false;
            });
          });

          // If no video found, try to find one that hasn't been scheduled on any 2 platforms
          if (!video) {
            video = selectedVideos.find(v => {
              const unscheduledCount = uniquePlatforms?.filter(platform => {
                if (platform === "tiktok" && !scheduledOnTikTok.has(v.videoUrl)) return true;
                if (platform === "instagram" && !scheduledOnInstagram.has(v.videoUrl)) return true;
                if (platform === "youtube" && !scheduledOnYouTube.has(v.videoUrl)) return true;
                return false;
              }).length || 0;

              return unscheduledCount >= 2;
            });
          }

          // If still no video found, find one that hasn't been scheduled on at least 1 platform
          if (!video) {
            video = selectedVideos.find(v => {
              return uniquePlatforms?.some(platform => {
                if (platform === "tiktok" && !scheduledOnTikTok.has(v.videoUrl)) return true;
                if (platform === "instagram" && !scheduledOnInstagram.has(v.videoUrl)) return true;
                if (platform === "youtube" && !scheduledOnYouTube.has(v.videoUrl)) return true;
                return false;
              });
            });
          }

          // If no suitable video found, we've scheduled everything possible
          if (!video) {
            hasMoreVideos = false;
            break;
          }

          // Determine which platforms we can schedule this video on
          const platformsToSchedule = profilePlatforms[currentProfileKey]?.filter(platform => {
            switch (platform) {
              case "tiktok": return !scheduledOnTikTok.has(video!.videoUrl);
              case "instagram": return !scheduledOnInstagram.has(video!.videoUrl);
              case "youtube": return !scheduledOnYouTube.has(video!.videoUrl);
              default: return false;
            }
          }) || [];

          // Find profile object to get social account IDs
          const profileObj = profiles?.find(p => p.profileKey === currentProfileKey);
          const socialAccountIds: Record<string, string> = {};

          if (profileObj && platformsToSchedule.length > 0) {
            // Map each platform to its corresponding social account ID
            platformsToSchedule.forEach(platform => {
              const socialAccount = profileObj.socialAccounts.find(
                account => account.platform.toLowerCase() === platform
              );
              if (socialAccount) {
                socialAccountIds[platform] = socialAccount._id.toString();
              }
            });
          }

          // Add to schedules array for later processing
          if (platformsToSchedule.length > 0) {
            const timeSlot = TIME_SLOTS.find(slot => slot.id === currentTimeSlot);

            if (timeSlot) {
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
                continue;
              }

              schedules.push({
                post: video.caption || "",
                platforms: platformsToSchedule,
                mediaUrls: [video.videoUrl],
                scheduleDate: scheduleDate,
                profileKey: currentProfileKey,
                videoId: video.videoId,
                socialAccountIds: socialAccountIds
              });

              // Mark video as scheduled on each selected platform
              platformsToSchedule.forEach(platform => {
                switch (platform) {
                  case "tiktok": scheduledOnTikTok.add(video!.videoUrl); break;
                  case "instagram": scheduledOnInstagram.add(video!.videoUrl); break;
                  case "youtube": scheduledOnYouTube.add(video!.videoUrl); break;
                }
              });
            }
          }
        }

        if (!hasMoreVideos) {
          break;
        }
      }
      if (!hasMoreVideos) {
        break;
      }
      currentDate = dateIterator.next().value;
    }

    setEndDate(currentDate);
    setSchedules(schedules);
    console.log("schedules", schedules);
  };

  const batchSchedule = async () => {
    setIsScheduling(true);
    setSchedulingProgress({
      total: schedules.length,
      completed: 0,
      inProgress: true
    });

    setShowProgressModal(true);

    const BATCH_SIZE = 5; // Process 5 schedules per batch
    let currentBatch = 0;

    const processBatch = async (): Promise<void> => {
      const startIdx = currentBatch * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, schedules.length);

      if (startIdx >= schedules.length) {
        // All batches processed
        return;
      }

      const batchSchedules = schedules.slice(startIdx, endIdx);

      try {
        await schedulePost({ schedules: batchSchedules });

        // Update progress
        currentBatch++;
        setSchedulingProgress(prev => ({
          ...prev,
          completed: Math.min(endIdx, schedules.length)
        }));

        // Process next batch if there are more schedules
        if (endIdx < schedules.length) {
          await processBatch();
        } else {
          // All done
          setSchedulingProgress(prev => ({
            ...prev,
            inProgress: false
          }));
          toast.success("All posts have been scheduled successfully");
          // Wait a moment before closing the progress modal
          setTimeout(() => {
            setShowProgressModal(false);
            onScheduleComplete();
          }, 2000);
        }
      } catch (error) {
        // Handle error
        setIsScheduling(false);
        setShowProgressModal(false);
        toast.error(error instanceof Error ? error.message : "Failed to schedule posts");
        setSchedulingProgress(prev => ({
          ...prev,
          inProgress: false
        }));
      }
    };

    // Start processing batches
    await processBatch();
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