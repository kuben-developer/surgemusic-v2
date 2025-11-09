import type { Id } from "../../../../../convex/_generated/dataModel";

/**
 * Lyric line with timestamp
 */
export interface LyricLine {
  timestamp: number;
  text: string;
}

/**
 * Word-level timing data from ElevenLabs
 */
export interface WordData {
  text: string;
  start: number;
  end: number;
  type: string;
  logprob?: number;
}

/**
 * Lyric line with word index mapping
 */
export interface LyricWithWords {
  timestamp: number;
  text: string;
  wordIndices: number[];
}

/**
 * Media data for a campaign
 */
export interface CampaignMediaData {
  audioFileId?: Id<"_storage">;
  audioUrl?: string;
  hasLyrics: boolean;
  lyrics?: LyricLine[];
  wordsData?: WordData[];
  lyricsWithWords?: LyricWithWords[];
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
