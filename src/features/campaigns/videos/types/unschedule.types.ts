export interface ScheduledVideo {
  id: string;
  videoName: string;
  videoUrl: string;
  postId: string;
  scheduledAt: Date;
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