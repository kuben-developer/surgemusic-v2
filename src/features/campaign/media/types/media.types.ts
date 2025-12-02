import type { Id } from "../../../../../convex/_generated/dataModel";

/**
 * Media data for a campaign
 */
export interface CampaignMediaData {
  audioFileId?: Id<"_storage">;
  audioUrl?: string;
  srtFileId?: Id<"_storage">;
  srtUrl?: string;
  hasLyrics: boolean;
}

/**
 * Caption item
 */
export interface Caption {
  _id: Id<"captions">;
  _creationTime: number;
  campaignId: string;
  text: string;
}
