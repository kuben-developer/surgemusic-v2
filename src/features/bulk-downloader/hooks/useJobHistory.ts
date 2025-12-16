"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import type {
  BulkDownloadJob,
  BulkDownloadJobId,
} from "../types/bulk-downloader.types";

interface UseJobHistoryReturn {
  jobs: BulkDownloadJob[] | undefined;
  activeJobs: BulkDownloadJob[] | undefined;
  completedJobs: BulkDownloadJob[] | undefined;
  isLoading: boolean;
  deleteJob: (jobId: BulkDownloadJobId) => Promise<void>;
  regenerateDownloadUrl: (jobId: BulkDownloadJobId) => Promise<string | null>;
}

export function useJobHistory(limit?: number): UseJobHistoryReturn {
  const jobs = useQuery(api.app.bulkDownloader.queries.getJobsByUser, {
    limit,
  });

  const activeJobs = useQuery(api.app.bulkDownloader.queries.getActiveJobs, {});

  const completedJobs = useQuery(api.app.bulkDownloader.queries.getCompletedJobs, {
    limit: limit ? Math.min(limit, 10) : 10,
  });

  const deleteJobMutation = useMutation(api.app.bulkDownloader.mutations.deleteJob);
  const regenerateUrlAction = useAction(api.app.bulkDownloader.actions.regenerateDownloadUrl);

  const isLoading = jobs === undefined;

  const deleteJob = async (jobId: BulkDownloadJobId): Promise<void> => {
    try {
      await deleteJobMutation({ jobId });
      toast.success("Download job deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete job";
      toast.error(message);
    }
  };

  const regenerateDownloadUrl = async (
    jobId: BulkDownloadJobId
  ): Promise<string | null> => {
    try {
      const result = await regenerateUrlAction({ jobId });
      toast.success("Download link refreshed");
      return result.zipUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to refresh download link";
      toast.error(message);
      return null;
    }
  };

  return {
    jobs,
    activeJobs,
    completedJobs,
    isLoading,
    deleteJob,
    regenerateDownloadUrl,
  };
}
