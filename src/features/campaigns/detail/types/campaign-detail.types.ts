import type { Doc } from "../../../../../convex/_generated/dataModel";

export interface CampaignHeaderProps {
  campaign?: Doc<"campaigns">;
  campaignId: string;
  generatedVideos?: Doc<"generatedVideos">[];
}

export interface VideoSectionProps {
  campaign?: Doc<"campaigns">;
  campaignId: string;
  generatedVideos?: Doc<"generatedVideos">[];
  isVideosLoading: boolean;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  videosPerPage: number;
  downloadingVideos: Record<string, boolean>;
  onDownloadVideo: (url: string, name: string, id: string) => void;
  onDownloadAll: (videos?: Doc<"generatedVideos">[]) => void;
  downloadingAll?: boolean;
}

export interface ProgressSectionProps {
  campaign?: Doc<"campaigns">;
  progress: number;
}