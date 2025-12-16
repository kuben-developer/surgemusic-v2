import type { Doc, Id } from "convex/_generated/dataModel";

// Job types from the database
export type BulkDownloadJob = Doc<"bulkDownloadJobs">;
export type BulkDownloadJobId = Id<"bulkDownloadJobs">;

// Job type
export type JobType = "videos" | "profiles";

// Job status
export type JobStatus =
  | "pending"
  | "fetching"
  | "downloading"
  | "zipping"
  | "uploading"
  | "completed"
  | "failed";

// Profile progress status
export type ProfileStatus =
  | "pending"
  | "fetching"
  | "downloading"
  | "completed"
  | "failed";

// Profile progress from the job
export interface ProfileProgress {
  username: string;
  profilePicture?: string;
  nickname?: string;
  status: ProfileStatus;
  totalVideos: number;
  downloadedVideos: number;
  errorMessage?: string;
}

// Job progress from the job
export interface JobProgress {
  totalItems: number;
  processedItems: number;
  downloadedVideos: number;
  failedVideos: number;
  currentPhase: string;
}

// Video entry in job result
export interface VideoEntry {
  filename: string;
  url: string;
  size: number;
}

// Job result when completed - array of video URLs for client-side zipping
export interface JobResult {
  videos: VideoEntry[];
  totalVideos: number;
  totalSize: number;
}

// Failed URL entry
export interface FailedUrl {
  url: string;
  reason: string;
}

// Input for creating a job
export interface CreateJobInput {
  type: JobType;
  urls: string[];
  uploadedBefore?: number;
}

// Result from creating a job
export interface CreateJobResult {
  jobId: BulkDownloadJobId;
  validCount: number;
  invalidCount: number;
  invalidUrls: FailedUrl[];
}

// Date filter options for profile downloads
export type DateFilterOption =
  | "all"
  | "last_week"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "last_year"
  | "custom";

// UI state for the URL input
export interface UrlInputState {
  rawText: string;
  parsedUrls: string[];
  validCount: number;
  invalidCount: number;
}
