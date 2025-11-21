"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { ClippedVideo, FolderId, VideoId } from "../types/clipper.types";

export function useFolderVideos(folderId: FolderId | null) {
  const folder = useQuery(
    api.app.clipperDb.getFolder,
    folderId ? { folderId } : "skip"
  );

  const videos = useQuery(
    api.app.clipperDb.getVideos,
    folderId ? { folderId } : "skip"
  );

  const deleteVideoMutation = useMutation(api.app.clipperDb.deleteVideo);

  const deleteVideo = async (videoId: VideoId) => {
    return await deleteVideoMutation({ videoId });
  };

  return {
    folder,
    videos: videos as ClippedVideo[] | undefined,
    isLoading: folder === undefined || videos === undefined,
    deleteVideo,
  };
}
