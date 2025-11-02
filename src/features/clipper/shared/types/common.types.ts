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

// Montager types
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
