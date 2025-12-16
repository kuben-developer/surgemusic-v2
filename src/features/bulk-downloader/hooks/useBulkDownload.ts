"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import type { JobType, CreateJobResult, BulkDownloadJobId } from "../types/bulk-downloader.types";
import { parseRawInput, validateUrls } from "../utils/url-parser.utils";

interface UseBulkDownloadReturn {
  createJob: (params: {
    type: JobType;
    rawUrls: string;
    uploadedBefore?: number;
  }) => Promise<CreateJobResult | null>;
  isCreating: boolean;
  lastCreatedJobId: BulkDownloadJobId | null;
}

export function useBulkDownload(): UseBulkDownloadReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreatedJobId, setLastCreatedJobId] = useState<BulkDownloadJobId | null>(null);

  const createJobMutation = useMutation(api.app.bulkDownloader.mutations.createJob);
  const startJobAction = useAction(api.app.bulkDownloader.actions.startJob);

  const createJob = async (params: {
    type: JobType;
    rawUrls: string;
    uploadedBefore?: number;
  }): Promise<CreateJobResult | null> => {
    setIsCreating(true);

    try {
      // Parse and validate URLs on client side first
      const urls = parseRawInput(params.rawUrls);
      const { valid, invalid } = validateUrls(urls, params.type);

      if (valid.length === 0) {
        const firstInvalid = invalid[0];
        const errorMessage = firstInvalid
          ? `No valid URLs found. ${firstInvalid.reason}`
          : "Please enter at least one URL";
        toast.error(errorMessage);
        return null;
      }

      // Create the job
      const result = await createJobMutation({
        type: params.type,
        urls,
        uploadedBefore: params.uploadedBefore,
      });

      setLastCreatedJobId(result.jobId);

      // Start the job processing
      await startJobAction({ jobId: result.jobId });

      // Show success message
      const typeLabel = params.type === "videos" ? "videos" : "profiles";
      toast.success(
        `Started downloading ${result.validCount} ${typeLabel}`,
        {
          description: result.invalidCount > 0
            ? `${result.invalidCount} invalid URLs were skipped`
            : undefined,
        }
      );

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create download job";
      toast.error(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createJob,
    isCreating,
    lastCreatedJobId,
  };
}
