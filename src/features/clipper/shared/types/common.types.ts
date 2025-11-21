export interface ClipperFolder {
  name: string;
  videoCount: number;
  clipCount: number;
  lastModified: number;
}

export interface ClipperClip {
  key: string;
  filename: string;
  size: number;
  lastModified: number;
  clarity: number;
  brightness: number;
  clipNumber: number;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export type SortField = "chronological" | "clarity" | "brightness" | "date" | "name";
export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

// Montager types (S3-based - legacy)
export interface MontagerFolder {
  name: string;
  montageCount: number;
  lastModified: number;
}

export interface Montage {
  key: string;
  filename: string;
  size: number;
  lastModified: number;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface MontageConfigInput {
  folderName: string;
  configName: string;
  selectedClipperFolders: string[];
  numberOfMontages: number;
}

export interface MontageData {
  montage_name: string;
  clips: string[];
}

// Montager types (Convex DB-based)
import type { Id } from "../../../../../convex/_generated/dataModel";

export type MontagerFolderId = Id<"montagerFolders">;
export type MontageConfigId = Id<"montageConfigs">;
export type MontagerVideoId = Id<"montagerVideos">;
export type ClipperFolderId = Id<"clipperFolders">;

export interface MontagerFolderDb {
  _id: MontagerFolderId;
  _creationTime: number;
  userId: Id<"users">;
  folderName: string;
  videoCount: number;
  configCount: number;
  pendingConfigs: number;
}

export interface MontagerVideoDb {
  _id: MontagerVideoId;
  _creationTime: number;
  montagerFolderId: MontagerFolderId;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface MontageConfigDb {
  _id: MontageConfigId;
  _creationTime: number;
  montagerFolderId: MontagerFolderId;
  clipperFolderIds: ClipperFolderId[];
  numberOfMontages: number;
  isProcessed: boolean;
}
