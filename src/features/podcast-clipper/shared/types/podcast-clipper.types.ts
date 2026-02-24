import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

export type PodcastClipperFolder = Doc<"podcastClipperFolders"> & {
  videoCount: number;
  reframedCount: number;
  calibrationStatus: "none" | "pending" | "detected" | "configured";
};

export type PodcastClipperVideo = Doc<"podcastClipperVideos">;

export type PodcastClipperConfig = Doc<"podcastClipperConfigs">;

export type PodcastClipperSceneType = Doc<"podcastClipperSceneTypes"> & {
  frameUrl: string | null;
  histogramUrl: string | null;
};

export type PodcastClipperTask = Doc<"podcastClipperTasks">;

export type PodcastFolderId = Id<"podcastClipperFolders">;
export type PodcastVideoId = Id<"podcastClipperVideos">;
export type PodcastSceneTypeId = Id<"podcastClipperSceneTypes">;

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}
