import type { Doc } from "../../../../../convex/_generated/dataModel";

type VideoData = Doc<"generatedVideos">;

export interface VideoStatusFlags {
  isPosted: boolean;
  isFailed: boolean;
  isScheduled: boolean;
}

export function getVideoStatusFlags(video: VideoData): VideoStatusFlags {
  const isPosted = Boolean(
    video.tiktokUpload?.status?.isPosted || 
    video.instagramUpload?.status?.isPosted || 
    video.youtubeUpload?.status?.isPosted
  );

  const isFailed = Boolean(
    video.tiktokUpload?.status?.isFailed || 
    video.instagramUpload?.status?.isFailed || 
    video.youtubeUpload?.status?.isFailed
  );

  const isScheduled = Boolean(
    (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
    (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
    (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined)
  );

  return { isPosted, isFailed, isScheduled };
}

export function filterVideosByStatus(videos: VideoData[], statusFilter: string): VideoData[] {
  if (statusFilter === "all") return videos;

  return videos.filter(video => {
    const { isPosted, isFailed, isScheduled } = getVideoStatusFlags(video);

    switch (statusFilter) {
      case "posted":
        return isPosted;
      case "failed":
        return isFailed;
      case "scheduled":
        return isScheduled && !isPosted && !isFailed;
      case "unscheduled":
        return !isScheduled && !isPosted && !isFailed;
      default:
        return true;
    }
  });
}

export function generateVideoCaption(songName: string, artistName: string, genre: string): string {
  return `${songName} by ${artistName} #${genre}`;
}