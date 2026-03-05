"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { PodcastFolderId } from "../../shared/types/podcast-clipper.types";

export function useCalibrationData(folderId: PodcastFolderId) {
  const folder = useQuery(api.app.podcastClipperDb.getFolder, { folderId });
  const config = useQuery(api.app.podcastClipperDb.getConfig, { folderId });
  const sceneTypes = useQuery(api.app.podcastClipperDb.getSceneTypes, { folderId });
  const cropKeyframes = useQuery(api.app.podcastClipperDb.getCropKeyframes, { folderId });

  return {
    folder,
    config,
    sceneTypes,
    cropKeyframes,
    isLoading:
      folder === undefined ||
      config === undefined ||
      sceneTypes === undefined ||
      cropKeyframes === undefined,
  };
}
