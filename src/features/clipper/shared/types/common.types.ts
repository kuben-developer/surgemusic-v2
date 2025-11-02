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
