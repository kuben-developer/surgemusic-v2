"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type {
  BulkDownloadJob,
  BulkDownloadJobId,
  JobStatus,
  ProfileProgress,
  JobProgress,
  JobResult,
} from "../types/bulk-downloader.types";

interface UseJobProgressReturn {
  job: BulkDownloadJob | null | undefined;
  isLoading: boolean;
  status: JobStatus | undefined;
  progress: JobProgress | undefined;
  profileProgress: ProfileProgress[] | undefined;
  result: JobResult | undefined;
  error: string | undefined;
  isCompleted: boolean;
  isFailed: boolean;
  isProcessing: boolean;
}

export function useJobProgress(
  jobId: BulkDownloadJobId | null | undefined
): UseJobProgressReturn {
  const job = useQuery(
    api.app.bulkDownloader.queries.getJob,
    jobId ? { jobId } : "skip"
  );

  const isLoading = job === undefined;
  const status = job?.status;
  const progress = job?.progress;
  const profileProgress = job?.profileProgress as ProfileProgress[] | undefined;
  const result = job?.result as JobResult | undefined;
  const error = job?.error;

  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isProcessing =
    status === "pending" ||
    status === "fetching" ||
    status === "downloading" ||
    status === "zipping" ||
    status === "uploading";

  return {
    job,
    isLoading,
    status,
    progress,
    profileProgress,
    result,
    error,
    isCompleted,
    isFailed,
    isProcessing,
  };
}
