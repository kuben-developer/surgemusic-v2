export interface TimeSlot {
  id: string;
  label: string;
  hour: number;
}

export interface Platform {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ScheduleData {
  post: string;
  platforms: string[];
  mediaUrls: string[];
  scheduleDate: string;
  profileKey: string;
  videoId: string;
  socialAccountIds?: Record<string, string>;
}

export interface SchedulingProgress {
  total: number;
  completed: number;
  inProgress: boolean;
}

export interface SelectedVideo {
  videoUrl: string;
  caption: string;
  videoName: string;
  videoId: string;
}

export type Step = "profiles" | "date" | "time" | "review";

export interface StepConfig {
  key: Step;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}