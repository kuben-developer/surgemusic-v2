"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";

interface UseGeneratedVideosProps {
  campaignId: string;
  categoryName: string;
  nicheName?: string;
}

export function useGeneratedVideos({
  campaignId,
  categoryName,
  nicheName,
}: UseGeneratedVideosProps) {
  const [error, setError] = useState<Error | null>(null);

  const videos = useQuery(
    api.app.generatedVideos.getReadyToPublishVideos,
    campaignId && categoryName
      ? { campaignId, categoryName, nicheName }
      : "skip"
  );

  // Track query errors (if the query returns undefined due to error)
  useEffect(() => {
    if (videos === undefined) {
      setError(null);
    }
  }, [videos]);

  return {
    videos: videos ?? [],
    isLoading: videos === undefined,
    error,
  };
}
