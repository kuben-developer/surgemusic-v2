"use client";

import { useState, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { toast } from "sonner";

interface UseCommentScrapeOptions {
  campaignId: string;
}

export function useCommentScrape({ campaignId }: UseCommentScrapeOptions) {
  const [isScraping, setIsScraping] = useState(false);

  // Get scrape status (includes active job progress)
  const scrapeStatus = useQuery(api.app.comments.getScrapeStatus, { campaignId });

  // Start scrape action
  const startScrapeAction = useAction(api.app.comments.startCommentScrape);

  const startScrape = useCallback(async (maxCommentsPerVideo = 100) => {
    if (isScraping || scrapeStatus?.activeJob) {
      toast.error("A scrape job is already in progress");
      return;
    }

    setIsScraping(true);
    try {
      const result = await startScrapeAction({
        campaignId,
        maxCommentsPerVideo,
      });
      toast.success(`Started scraping comments from ${result.totalVideos} videos`);
    } catch (error) {
      console.error("Failed to start scrape:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start scraping");
    } finally {
      setIsScraping(false);
    }
  }, [campaignId, isScraping, scrapeStatus?.activeJob, startScrapeAction]);

  // Determine if scraping is active (either local state or server state)
  const isActive = isScraping || !!scrapeStatus?.activeJob;

  // Calculate progress percentage
  const progressPercent = scrapeStatus?.activeJob
    ? Math.round(
        (scrapeStatus.activeJob.progress.processedVideos / scrapeStatus.activeJob.progress.totalVideos) * 100
      )
    : 0;

  return {
    // Status
    totalComments: scrapeStatus?.totalComments ?? 0,
    selectedCount: scrapeStatus?.selectedCount ?? 0,
    lastScrapedAt: scrapeStatus?.lastScrapedAt ?? null,
    isLoading: scrapeStatus === undefined,

    // Active job
    isActive,
    activeJob: scrapeStatus?.activeJob ?? null,
    progressPercent,

    // Actions
    startScrape,
  };
}
