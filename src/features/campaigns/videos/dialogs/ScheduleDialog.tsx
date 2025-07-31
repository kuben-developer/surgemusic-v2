"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useQuery, useAction } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Clock3,
  Share2,
  Users
} from "lucide-react"
import { useState } from "react"

// ProgressModal component to display scheduling progress
function ProgressModal({
  isOpen,
  onOpenChange,
  progress
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  progress: { total: number; completed: number; inProgress: boolean; }
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Scheduling in Progress</DialogTitle>
          <DialogDescription>
            Please keep this window open until scheduling is complete
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Please don't close this window</p>
              <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
                Your posts are being scheduled in batches. This process may take a few minutes to complete.
              </p>
            </div>
          </div>

          <div className="bg-muted/10 rounded-md p-4 border border-primary/10">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Scheduling progress</span>
              <span className="text-sm font-medium">
                {progress.completed} of {progress.total}
              </span>
            </div>

            <div className="w-full bg-muted/20 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`
                }}
              ></div>
            </div>

            <div className="flex justify-between mt-3">
              <p className="text-sm text-muted-foreground">
                {progress.completed < progress.total
                  ? `Processing batch ${Math.floor(progress.completed / 5) + 1} of ${Math.ceil(progress.total / 5)}`
                  : "All posts scheduled successfully!"}
              </p>

              {progress.inProgress && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="text-xs">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ScheduleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedVideosCount: number
  selectedVideos: { videoUrl: string, caption: string, videoName: string, videoId: string }[]
}

// SVG Icons for platforms
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" fill="currentColor" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 1.44144C10.136 1.44144 10.3893 1.44144 11.2327 1.49078C12.0127 1.53078 12.4327 1.67078 12.7193 1.79078C13.0727 1.94144 13.3593 2.13078 13.636 2.40744C13.9127 2.68411 14.1127 2.97078 14.2527 3.32411C14.3727 3.61078 14.5127 4.03078 14.5527 4.81078C14.6027 5.65411 14.6027 5.90744 14.6027 8.04344C14.6027 10.1794 14.6027 10.4328 14.5527 11.2761C14.5127 12.0561 14.3727 12.4761 14.2527 12.7628C14.1027 13.1161 13.9127 13.4028 13.636 13.6794C13.3593 13.9561 13.0727 14.1561 12.7193 14.2961C12.4327 14.4161 12.0127 14.5561 11.2327 14.5961C10.3893 14.6461 10.136 14.6461 8 14.6461C5.864 14.6461 5.61067 14.6461 4.76733 14.5961C3.98733 14.5561 3.56733 14.4161 3.28067 14.2961C2.92733 14.1461 2.64067 13.9561 2.364 13.6794C2.08733 13.4028 1.88733 13.1161 1.74733 12.7628C1.62733 12.4761 1.48733 12.0561 1.44733 11.2761C1.39733 10.4328 1.39733 10.1794 1.39733 8.04344C1.39733 5.90744 1.39733 5.65411 1.44733 4.81078C1.48733 4.03078 1.62733 3.61078 1.74733 3.32411C1.89733 2.97078 2.08733 2.68411 2.364 2.40744C2.64067 2.13078 2.92733 1.93078 3.28067 1.79078C3.56733 1.67078 3.98733 1.53078 4.76733 1.49078C5.61067 1.44144 5.864 1.44144 8 1.44144ZM8 0.0434418C5.82733 0.0434418 5.55067 0.0434418 4.69733 0.0927751C3.84733 0.142775 3.26733 0.292775 2.76733 0.492775C2.24733 0.702775 1.81733 0.982775 1.39067 1.41078C0.964 1.83744 0.684 2.26744 0.474 2.78744C0.274 3.28744 0.124 3.86744 0.0746667 4.71744C0.0253333 5.57078 0.0253333 5.84744 0.0253333 8.02011C0.0253333 10.1928 0.0253333 10.4694 0.0746667 11.3228C0.124 12.1728 0.274 12.7528 0.474 13.2528C0.684 13.7728 0.964 14.2028 1.39067 14.6294C1.81733 15.0561 2.24733 15.3361 2.76733 15.5461C3.26733 15.7461 3.84733 15.8961 4.69733 15.9461C5.55067 15.9954 5.82733 15.9954 8 15.9954C10.1727 15.9954 10.4493 15.9954 11.3027 15.9461C12.1527 15.8961 12.7327 15.7461 13.2327 15.5461C13.7527 15.3361 14.1827 15.0561 14.6093 14.6294C15.036 14.2028 15.316 13.7728 15.526 13.2528C15.726 12.7528 15.876 12.1728 15.926 11.3228C15.9753 10.4694 15.9753 10.1928 15.9753 8.02011C15.9753 5.84744 15.9753 5.57078 15.926 4.71744C15.876 3.86744 15.726 3.28744 15.526 2.78744C15.316 2.26744 15.036 1.83744 14.6093 1.41078C14.1827 0.984108 13.7527 0.704108 13.2327 0.494108C12.7327 0.294108 12.1527 0.144108 11.3027 0.0941084C10.4493 0.0434418 10.1727 0.0434418 8 0.0434418Z" fill="currentColor" />
    <path d="M8 3.89078C5.73067 3.89078 3.89067 5.73078 3.89067 8.00011C3.89067 10.2694 5.73067 12.1094 8 12.1094C10.2693 12.1094 12.1093 10.2694 12.1093 8.00011C12.1093 5.73078 10.2693 3.89078 8 3.89078ZM8 10.6694C6.52733 10.6694 5.33067 9.47278 5.33067 8.00011C5.33067 6.52744 6.52733 5.33078 8 5.33078C9.47267 5.33078 10.6693 6.52744 10.6693 8.00011C10.6693 9.47278 9.47267 10.6694 8 10.6694Z" fill="currentColor" />
    <path d="M12.2707 4.69078C12.8027 4.69078 13.2333 4.26019 13.2333 3.72811C13.2333 3.19603 12.8027 2.76544 12.2707 2.76544C11.7386 2.76544 11.308 3.19603 11.308 3.72811C11.308 4.26019 11.7386 4.69078 12.2707 4.69078Z" fill="currentColor" />
  </svg>
)

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15.6654 4.27525C15.4814 3.58325 14.9374 3.03925 14.2454 2.85525C13.0054 2.53325 7.99938 2.53325 7.99938 2.53325C7.99938 2.53325 2.99338 2.53325 1.75338 2.85525C1.06138 3.03925 0.517375 3.58325 0.333375 4.27525C0.0113752 5.51525 0.0113752 8.00725 0.0113752 8.00725C0.0113752 8.00725 0.0113752 10.4993 0.333375 11.7393C0.517375 12.4313 1.06138 12.9753 1.75338 13.1593C2.99338 13.4813 7.99938 13.4813 7.99938 13.4813C7.99938 13.4813 13.0054 13.4813 14.2454 13.1593C14.9374 12.9753 15.4814 12.4313 15.6654 11.7393C15.9874 10.4993 15.9874 8.00725 15.9874 8.00725C15.9874 8.00725 15.9874 5.51525 15.6654 4.27525ZM6.39938 10.3873V5.62725L10.5594 8.00725L6.39938 10.3873Z" fill="currentColor" />
  </svg>
)

// Available time slots for posting (24 hours)
const TIME_SLOTS = [
  { id: "12am", label: "12:00 AM", hour: 0 },
  { id: "1am", label: "1:00 AM", hour: 1 },
  { id: "2am", label: "2:00 AM", hour: 2 },
  { id: "3am", label: "3:00 AM", hour: 3 },
  { id: "4am", label: "4:00 AM", hour: 4 },
  { id: "5am", label: "5:00 AM", hour: 5 },
  { id: "6am", label: "6:00 AM", hour: 6 },
  { id: "7am", label: "7:00 AM", hour: 7 },
  { id: "8am", label: "8:00 AM", hour: 8 },
  { id: "9am", label: "9:00 AM", hour: 9 },
  { id: "10am", label: "10:00 AM", hour: 10 },
  { id: "11am", label: "11:00 AM", hour: 11 },
  { id: "12pm", label: "12:00 PM", hour: 12 },
  { id: "1pm", label: "1:00 PM", hour: 13 },
  { id: "2pm", label: "2:00 PM", hour: 14 },
  { id: "3pm", label: "3:00 PM", hour: 15 },
  { id: "4pm", label: "4:00 PM", hour: 16 },
  { id: "5pm", label: "5:00 PM", hour: 17 },
  { id: "6pm", label: "6:00 PM", hour: 18 },
  { id: "7pm", label: "7:00 PM", hour: 19 },
  { id: "8pm", label: "8:00 PM", hour: 20 },
  { id: "9pm", label: "9:00 PM", hour: 21 },
  { id: "10pm", label: "10:00 PM", hour: 22 },
  { id: "11pm", label: "11:00 PM", hour: 23 },
]

// Available platforms
const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: TikTokIcon },
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "youtube", label: "YouTube", icon: YouTubeIcon },
]

type Step = "profiles" | "date" | "time" | "review"

export function ScheduleDialog({ isOpen, onOpenChange, selectedVideosCount, selectedVideos }: ScheduleDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>("profiles")
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [isScheduling, setIsScheduling] = useState(false)
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [schedules, setSchedules] = useState<{
    post: string,
    platforms: string[],
    mediaUrls: string[],
    scheduleDate: string,
    profileKey: string,
    videoId: string,
    socialAccountIds?: Record<string, string>
  }[]>([])
  const [schedulingProgress, setSchedulingProgress] = useState({
    total: 0,
    completed: 0,
    inProgress: false
  })
  const [showProgressModal, setShowProgressModal] = useState(false)

  // Profile-platform selection
  const [profilePlatforms, setProfilePlatforms] = useState<Record<string, string[]>>({})
  const [lastSelectedProfileIndex, setLastSelectedProfileIndex] = useState<number | null>(null)

  // Fetch profiles from the API
  const profiles = useQuery(api.ayrshare.getProfiles)
  const isLoadingProfiles = profiles === undefined

  const schedulePost = useAction(api.ayrshare.schedulePost)

  // Function to schedule posts in batches
  const batchSchedule = async () => {
    setIsScheduling(true)
    setSchedulingProgress({
      total: schedules.length,
      completed: 0,
      inProgress: true
    })

    // Close scheduling dialog and open progress modal
    onOpenChange(false)
    setShowProgressModal(true)

    const BATCH_SIZE = 5 // Process 5 schedules per batch
    let currentBatch = 0

    const processBatch = async () => {
      const startIdx = currentBatch * BATCH_SIZE
      const endIdx = Math.min(startIdx + BATCH_SIZE, schedules.length)

      if (startIdx >= schedules.length) {
        // All batches processed
        return
      }

      const batchSchedules = schedules.slice(startIdx, endIdx)


      try {
        await schedulePost({ schedules: batchSchedules })

        // Update progress
        currentBatch++
        setSchedulingProgress(prev => ({
          ...prev,
          completed: Math.min(endIdx, schedules.length)
        }))

        // Process next batch if there are more schedules
        if (endIdx < schedules.length) {
          await processBatch()
        } else {
          // All done
          setSchedulingProgress(prev => ({
            ...prev,
            inProgress: false
          }))
          toast.success("All posts have been scheduled successfully")
          // Wait a moment before closing the progress modal
          setTimeout(() => {
            setShowProgressModal(false)
          }, 2000)
        }
      } catch (error) {
        // Handle error
        setIsScheduling(false)
        setShowProgressModal(false)
        toast.error(error instanceof Error ? error.message : "Failed to schedule posts")
        setSchedulingProgress(prev => ({
          ...prev,
          inProgress: false
        }))
      }
    }

    // Start processing batches
    await processBatch()
  }

  const generateSchedules = () => {
    console.log("profilePlatforms", profilePlatforms)
    console.log("selectedTimeSlots", selectedTimeSlots)
    console.log("startDate", startDate)
    console.log("selectedVideos", selectedVideos)

    const schedules: {
      post: string,
      platforms: string[],
      mediaUrls: string[],
      scheduleDate: string,
      profileKey: string,
      videoId: string,
      socialAccountIds?: Record<string, string>
    }[] = []

    const profileKeys = Object.keys(profilePlatforms)
    const uniquePlatforms = getAllSelectedPlatforms()

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
              case "tiktok": return !scheduledOnTikTok.has(video.videoUrl);
              case "instagram": return !scheduledOnInstagram.has(video.videoUrl);
              case "youtube": return !scheduledOnYouTube.has(video.videoUrl);
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
              })()
              // Skip scheduling if the date is in the past (with x minute buffer)
              const now = new Date();
              now.setMinutes(now.getMinutes() + 10); // Add x minutes to current time
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
                  case "tiktok": scheduledOnTikTok.add(video.videoUrl); break;
                  case "instagram": scheduledOnInstagram.add(video.videoUrl); break;
                  case "youtube": scheduledOnYouTube.add(video.videoUrl); break;
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

    setEndDate(currentDate)
    setSchedules(schedules)
    console.log("schedules", schedules)
  }

  // Toggle time slot selection with a limit of 3
  const toggleTimeSlot = (slotId: string) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId)
      } else {
        // Enforce max 3 posts per day
        if (prev.length >= 3) {
          return prev
        }
        return [...prev, slotId]
      }
    })
  }

  // Toggle platform for a specific profile
  const toggleProfilePlatform = (profileId: string, platformId: string) => {
    setProfilePlatforms(prev => {
      const currentPlatforms = prev[profileId] || []
      const newPlatforms = currentPlatforms.includes(platformId)
        ? currentPlatforms.filter(p => p !== platformId)
        : [...currentPlatforms, platformId]

      return {
        ...prev,
        [profileId]: newPlatforms
      }
    })
  }

  // Handle profile selection with shift-click support
  const handleProfileClick = (profileIndex: number, profileKey: string, platformId: string, event: React.MouseEvent) => {
    if (!profiles) return

    const profile = profiles[profileIndex]
    const hasAccount = profile?.socialAccounts.some(
      account => account.platform.toLowerCase() === platformId
    )

    if (!hasAccount) return

    if (event.shiftKey && lastSelectedProfileIndex !== null) {
      // Shift-click: select range of profiles
      const start = Math.min(lastSelectedProfileIndex, profileIndex)
      const end = Math.max(lastSelectedProfileIndex, profileIndex)

      setProfilePlatforms(prev => {
        const newState = { ...prev }

        for (let i = start; i <= end; i++) {
          const p = profiles[i]
          if (!p) continue

          // Check if this profile has the platform
          const hasThisPlatform = p.socialAccounts.some(
            account => account.platform.toLowerCase() === platformId
          )

          if (hasThisPlatform) {
            const currentPlatforms = newState[p.profileKey] || []
            if (!currentPlatforms.includes(platformId)) {
              newState[p.profileKey] = [...currentPlatforms, platformId]
            }
          }
        }

        return newState
      })
    } else {
      // Normal click
      toggleProfilePlatform(profileKey, platformId)
    }

    setLastSelectedProfileIndex(profileIndex)
  }

  // Select all profiles for a specific platform
  const selectAllForPlatform = (platformId: string) => {
    if (!profiles) return

    setProfilePlatforms(prev => {
      const newState = { ...prev }

      profiles.forEach(profile => {
        const hasAccount = profile.socialAccounts.some(
          account => account.platform.toLowerCase() === platformId
        )

        if (hasAccount) {
          const currentPlatforms = newState[profile.profileKey] || []
          if (!currentPlatforms.includes(platformId)) {
            newState[profile.profileKey] = [...currentPlatforms, platformId]
          }
        }
      })

      return newState
    })
  }

  // Unselect all profiles for a specific platform
  const unselectAllForPlatform = (platformId: string) => {
    setProfilePlatforms(prev => {
      const newState = { ...prev }

      Object.keys(newState).forEach(profileKey => {
        if (newState[profileKey]) {
          newState[profileKey] = newState[profileKey].filter(p => p !== platformId)
        }
      })

      return newState
    })
  }

  // Get selected profiles (profiles with at least one platform selected)
  const getSelectedProfiles = () => {
    return Object.entries(profilePlatforms)
      .filter(([_, platforms]) => platforms.length > 0)
      .map(([profileId]) => profileId)
  }

  // Get all selected platforms across all profiles
  const getAllSelectedPlatforms = () => {
    const platforms = new Set<string>()
    Object.values(profilePlatforms).forEach(profilePlatforms => {
      profilePlatforms.forEach(platform => platforms.add(platform))
    })
    return Array.from(platforms)
  }

  // Check if any profile has a specific platform selected
  const isAnyProfileSelectedForPlatform = (platformId: string) => {
    return Object.values(profilePlatforms).some(platforms => platforms.includes(platformId))
  }

  // Check if all profiles with a platform have it selected
  const areAllProfilesSelectedForPlatform = (platformId: string) => {
    if (!profiles) return false

    const profilesWithPlatform = profiles.filter(profile =>
      profile.socialAccounts.some(account => account.platform.toLowerCase() === platformId)
    )

    if (profilesWithPlatform.length === 0) return false

    return profilesWithPlatform.every(profile =>
      (profilePlatforms[profile.profileKey] || []).includes(platformId)
    )
  }

  // Check if current step is valid to proceed
  const isStepValid = () => {
    switch (currentStep) {
      case "profiles":
        return getSelectedProfiles().length > 0
      case "date":
        return true // Date is always valid as we have a default
      case "time":
        return selectedTimeSlots.length > 0
      default:
        return true
    }
  }

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === "profiles") setCurrentStep("date")
    else if (currentStep === "date") setCurrentStep("time")
    else if (currentStep === "time") {
      setCurrentStep("review")
      generateSchedules()
    }
  }

  // Navigate to previous step
  const goToPrevStep = () => {
    if (currentStep === "date") setCurrentStep("profiles")
    else if (currentStep === "time") setCurrentStep("date")
    else if (currentStep === "review") setCurrentStep("time")
  }


  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case "profiles":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-medium flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select profiles and platforms
                <Badge variant="secondary" className="ml-auto">
                  {getSelectedProfiles().length} profiles
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose which social media profiles to post to and select platforms for each. Hold Shift and click to select multiple profiles at once.
              </p>

              {/* Select/Unselect All buttons */}
              <div className="flex gap-2 p-2 bg-muted/20 rounded-lg border border-muted/30">
                {PLATFORMS.map(platform => {
                  const Icon = platform.icon
                  const isAllSelected = areAllProfilesSelectedForPlatform(platform.id)
                  const isAnySelected = isAnyProfileSelectedForPlatform(platform.id)

                  return (
                    <Button
                      key={platform.id}
                      variant={isAllSelected ? "default" : isAnySelected ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        if (isAllSelected) {
                          unselectAllForPlatform(platform.id)
                        } else {
                          selectAllForPlatform(platform.id)
                        }
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">
                        {isAllSelected ? "Unselect" : "Select"} all {platform.label}
                      </span>
                    </Button>
                  )
                })}
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
                {isLoadingProfiles ? (
                  <div className="text-center py-4">Loading profiles...</div>
                ) : profiles?.map((profile, profileIndex) => (
                  <div
                    key={profile.profileKey}
                    className="rounded-lg border border-primary/10 bg-muted/5 p-3 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {profile.profileName.split("|")[0]?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{profile.profileName.split("|")[0]}</div>
                          <div className="text-xs text-muted-foreground">
                            {profile.socialAccounts.length} connected accounts
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {PLATFORMS.map(platform => {
                          const hasAccount = profile.socialAccounts.some(
                            account => account.platform.toLowerCase() === platform.id
                          )
                          const isSelected = (profilePlatforms[profile.profileKey] || []).includes(platform.id)
                          const Icon = platform.icon
                          return (
                            <div key={platform.id} className="relative">
                              <Button
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-8 px-2 flex items-center gap-1.5 min-w-[80px] relative",
                                  !hasAccount && "bg-muted/90 border-dashed opacity-50",
                                  !isSelected && hasAccount && "opacity-70"
                                )}
                                onClick={(e) => handleProfileClick(profileIndex, profile.profileKey, platform.id, e)}
                                disabled={!hasAccount}
                                title={!hasAccount ? `No ${platform.id} account connected` : `Post to ${platform.id} (Hold Shift to select multiple)`}
                              >
                                <Icon className={cn("h-4 w-4", !hasAccount && "opacity-50")} />
                                <span className={cn("text-xs capitalize", !hasAccount && "opacity-50")}>
                                  {platform.id}
                                </span>
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "date":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-medium flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select start date
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose when you want to start publishing your posts.
              </p>
              <div className="flex justify-center p-2">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>
              <div className="text-sm text-center text-muted-foreground pt-2">
                Your campaign will start on <span className="font-medium">{format(startDate, "MMMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        )

      case "time":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-medium flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Select posting times
                <Badge variant="secondary" className="ml-auto">
                  {selectedTimeSlots.length}/3 selected
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose up to 3 times when your posts will be published each day.
              </p>
              <div className="grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto p-1">
                {TIME_SLOTS.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedTimeSlots.includes(slot.id) ? "default" : "outline"}
                    className={cn(
                      "w-full justify-center",
                      selectedTimeSlots.includes(slot.id) ? "bg-primary" : "hover:bg-muted",
                      selectedTimeSlots.length >= 3 && !selectedTimeSlots.includes(slot.id) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => toggleTimeSlot(slot.id)}
                    disabled={selectedTimeSlots.length >= 3 && !selectedTimeSlots.includes(slot.id)}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case "review":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-medium flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Schedule Summary
              </h3>
              <div className="rounded-lg border border-primary/10 bg-muted/10 p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Videos to schedule:
                    </span>
                    <span className="font-medium">{selectedVideosCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      Posts per day:
                    </span>
                    <span className="font-medium">{selectedTimeSlots.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Start date:
                    </span>
                    <span className="font-medium">{format(startDate, "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4" />
                      End date (estimated):
                    </span>
                    <span className="font-medium">{format(endDate, "MMMM d, yyyy")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-primary/10">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Posting Times
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTimeSlots.map((slotId) => (
                      <Badge key={slotId} variant="outline" className="bg-muted/30 border-primary/10 flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {TIME_SLOTS.find(slot => slot.id === slotId)?.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-primary/10">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Selected Profiles
                  </h4>
                  <div className="space-y-2">
                    {getSelectedProfiles().map(profileKey => {
                      const profile = profiles?.find(p => p.profileKey === profileKey);
                      const platforms = profilePlatforms[profileKey] || [];

                      return profile ? (
                        <div key={profileKey} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/10 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                              {profile.profileName.split("|")[0]?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-medium">{profile.profileName.split("|")[0] || ""}</span>
                              <div className="text-xs text-muted-foreground">{profile.socialAccounts.length} connected accounts</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {platforms.map((platform: string) => {
                              const Icon = PLATFORMS.find(p => p.id === platform)?.icon || TikTokIcon;
                              return (
                                <Badge key={platform} variant="outline" className="bg-muted/30 border-primary/10">
                                  <Icon className="h-3 w-3 mr-1" />
                                  {platform}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {selectedTimeSlots.length < 3 && (
              <div className="flex items-center gap-2 text-sm text-amber-500 mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>Tip: Adding more posting times could help complete your schedule faster</span>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Render step indicator
  const renderStepIndicator = () => {
    const steps: { key: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
      { key: "profiles", label: "Profiles", icon: Users },
      { key: "date", label: "Date", icon: CalendarIcon },
      { key: "time", label: "Times", icon: Clock },
      { key: "review", label: "Review", icon: CheckCircle2 },
    ]

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
                currentStep === step.key
                  ? "bg-primary text-primary-foreground"
                  : steps.findIndex(s => s.key === currentStep) > index
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {<step.icon className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                "text-xs mx-2",
                currentStep === step.key
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-4 sm:w-8 bg-muted transition-colors",
                  steps.findIndex(s => s.key === currentStep) > index && "bg-primary/50"
                )}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Schedule {selectedVideosCount} posts</DialogTitle>
            <DialogDescription>
              Configure your posting schedule and preferences
            </DialogDescription>
          </DialogHeader>

          {renderStepIndicator()}
          {renderStepContent()}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={currentStep === "profiles" ? () => onOpenChange(false) : goToPrevStep}
              className="gap-2"
              disabled={isScheduling}
            >
              {currentStep === "profiles" ? (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </>
              )}
            </Button>

            {currentStep === "review" ? (
              <Button
                onClick={batchSchedule}
                disabled={!isStepValid() || isScheduling}
                className="gap-2"
              >
                {isScheduling ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Schedule {selectedVideosCount} posts
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={!isStepValid() || isScheduling}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Separate progress modal */}
      <ProgressModal
        isOpen={showProgressModal}
        onOpenChange={(open) => {
          // Only allow closing if not in progress
          if (!schedulingProgress.inProgress) {
            setShowProgressModal(open)
          }
        }}
        progress={schedulingProgress}
      />
    </>
  )
} 