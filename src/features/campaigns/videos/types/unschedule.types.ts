import type { Id } from "../../../../../convex/_generated/dataModel";

export interface ScheduledVideo {
  id: Id<"generatedVideos">;
  videoName: string;
  videoUrl: string;
  postId: string;
  // Epoch milliseconds; convert to Date in UI as needed
  scheduledAt: number;
  postCaption: string;
  scheduledSocialAccounts: {
    platform: string;
    username: string;
  }[];
}

export interface UnscheduleResult {
  postId: string;
  success: boolean;
  error?: string;
}

export interface UnscheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  onUnscheduleComplete?: () => void;
}
