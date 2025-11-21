import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

export type ClipperFolder = Doc<"clipperFolders"> & {
  videoCount: number;
  clipCount: number;
};

export type ClippedVideo = Doc<"clippedVideoUrls">;

export interface OutputUrl {
  videoUrl: string;
  thumbnailUrl: string;
  clipNumber: number;
  brightness: number;
  clarity: number;
  isDeleted: boolean;
}

export type FolderId = Id<"clipperFolders">;
export type VideoId = Id<"clippedVideoUrls">;

// Clip with index for selection
export interface ClipWithIndex extends OutputUrl {
  index: number;
}

// Sorting types
export type SortField = "chronological" | "clarity" | "brightness";
export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}
