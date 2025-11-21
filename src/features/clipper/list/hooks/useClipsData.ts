"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { FolderId, ClipWithIndex } from "../types/clipper.types";

/**
 * Hook for fetching and managing clips for a specific input video
 */
export function useClipsData(folderId: FolderId | null, inputVideoName: string | null) {
  const video = useQuery(
    api.app.clipperDb.getVideoByName,
    folderId && inputVideoName ? { folderId, inputVideoName } : "skip"
  );

  const folder = useQuery(
    api.app.clipperDb.getFolder,
    folderId ? { folderId } : "skip"
  );

  const softDeleteClipsMutation = useMutation(api.app.clipperDb.softDeleteClips);
  const restoreClipsMutation = useMutation(api.app.clipperDb.restoreClips);

  // Filter out deleted clips and add index
  const clips: ClipWithIndex[] = video
    ? video.outputUrls
        .map((clip, index) => ({ ...clip, index }))
        .filter((clip) => !clip.isDeleted)
    : [];

  // All clips including deleted (for counting)
  const allClips = video?.outputUrls || [];
  const totalClips = allClips.length;
  const activeClips = clips.length;
  const deletedClips = totalClips - activeClips;

  const softDeleteClips = async (indices: number[]) => {
    if (!video) return;
    return await softDeleteClipsMutation({
      videoId: video._id,
      clipIndices: indices,
    });
  };

  const restoreClips = async (indices: number[]) => {
    if (!video) return;
    return await restoreClipsMutation({
      videoId: video._id,
      clipIndices: indices,
    });
  };

  return {
    video,
    folder,
    clips,
    isLoading: video === undefined || folder === undefined,
    totalClips,
    activeClips,
    deletedClips,
    softDeleteClips,
    restoreClips,
  };
}
