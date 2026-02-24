"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { PodcastFolderId, PodcastVideoId } from "../../shared/types/podcast-clipper.types";

export function useFolderDetail(folderId: PodcastFolderId) {
  const folder = useQuery(api.app.podcastClipperDb.getFolder, { folderId });
  const videos = useQuery(api.app.podcastClipperDb.getVideos, { folderId });
  const config = useQuery(api.app.podcastClipperDb.getConfig, { folderId });
  const sceneTypes = useQuery(api.app.podcastClipperDb.getSceneTypes, { folderId });
  const tasks = useQuery(api.app.podcastClipperDb.getTasks, { folderId });

  const deleteVideoMutation = useMutation(api.app.podcastClipperDb.deleteVideo);
  const startCalibrationMutation = useMutation(api.app.podcastClipperDb.startCalibration);
  const startReframeMutation = useMutation(api.app.podcastClipperDb.startReframe);

  const deleteVideo = async (videoId: PodcastVideoId) => {
    try {
      await deleteVideoMutation({ videoId });
      toast.success("Video deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete video");
    }
  };

  const startCalibration = async (
    referenceVideoId: Id<"podcastClipperVideos">,
    sceneThreshold?: number,
    clusterThreshold?: number
  ) => {
    try {
      await startCalibrationMutation({
        folderId,
        referenceVideoId,
        sceneThreshold,
        clusterThreshold,
      });
      toast.success("Calibration started");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start calibration");
    }
  };

  const startReframe = async (videoIds: Id<"podcastClipperVideos">[]) => {
    try {
      await startReframeMutation({ folderId, videoIds });
      toast.success(`Reframing ${videoIds.length} video(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start reframe");
    }
  };

  return {
    folder,
    videos,
    config,
    sceneTypes,
    tasks,
    isLoading: folder === undefined,
    deleteVideo,
    startCalibration,
    startReframe,
  };
}
