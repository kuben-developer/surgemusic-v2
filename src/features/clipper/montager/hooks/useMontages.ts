"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { MontagerFolderId, MontagerVideoId } from "../../shared/types/common.types";

export function useMontages(folderId: MontagerFolderId | null) {
  const videos = useQuery(
    api.app.montagerDb.getVideos,
    folderId ? { folderId } : "skip"
  );
  const configs = useQuery(
    api.app.montagerDb.getConfigs,
    folderId ? { folderId } : "skip"
  );
  const deleteVideoMutation = useMutation(api.app.montagerDb.deleteVideo);

  const isLoading = videos === undefined || configs === undefined;
  const pendingConfigs = configs?.filter((c) => !c.isProcessed) ?? [];

  const deleteVideo = async (videoId: MontagerVideoId) => {
    try {
      await deleteVideoMutation({ videoId });
      toast.success("Video deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete video";
      toast.error(message);
      throw error;
    }
  };

  return {
    videos: videos ?? [],
    configs: configs ?? [],
    pendingConfigs,
    isLoading,
    deleteVideo,
  };
}
