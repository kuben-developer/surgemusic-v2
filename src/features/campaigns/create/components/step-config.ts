import type { ComponentType } from "react";
// import { CampaignInfo } from "./CampaignInfo";
import { ContentThemes } from "./ContentThemes";
import { GenreSelection } from "./GenreSelection";
import { ImageAssets } from "./ImageAssets";
import { LyricsSelection } from "./LyricsSelection";
import { SongAudio } from "./SongAudio";
import { SongDetails } from "./SongDetails";
import { VideoAssets } from "./VideoAssets";
import { VideoCount } from "./VideoCount";
import { type LyricsLine } from "@/utils/srt-converter.utils";

export interface StepProps {
  // Campaign Info
  campaignName: string;
  setCampaignName: (value: string) => void;
  campaignType: "custom" | "express";
  setCampaignType: (value: "custom" | "express") => void;
  campaignNameError: boolean;

  // Song Details
  songName: string;
  setSongName: (value: string) => void;
  artistName: string;
  setArtistName: (value: string) => void;
  songDetailsError: boolean;

  // Song Audio
  songAudioUrl: string | null;
  setSongAudioUrl: (value: string | null) => void;
  songAudioBase64: string | null;
  setSongAudioBase64: (value: string | null) => void;
  songAudioError: boolean;

  // Genre
  selectedGenre: "rap" | "pop" | "indie" | "country" | "rnb" | "afrobeats" | "rock" | "metal" | "reggaeton" | "house" | "techno" | "edm" | "other_electronic" | "other" | null;
  setSelectedGenre: (value: "rap" | "pop" | "indie" | "country" | "rnb" | "afrobeats" | "rock" | "metal" | "reggaeton" | "house" | "techno" | "edm" | "other_electronic" | "other" | null) => void;
  genreError: boolean;

  // Video Count
  selectedVideoCount: number | null;
  setSelectedVideoCount: (value: number | null) => void;
  videoCountError: boolean;
  totalCredits: number;
  isSubscribed: boolean;
  isTrial?: boolean;
  hasProFeatures?: boolean;
  isFirstTimeUser?: boolean;
  qualifiesForFreeVideos?: boolean;

  // Image Assets
  albumArtUrl: string | null;
  setAlbumArtUrl: (value: string | null) => void;
  albumArtBase64: string | null;
  setAlbumArtBase64: (value: string | null) => void;
  albumArtError: boolean;

  // Video Assets
  musicVideoUrl: string | null;
  setMusicVideoUrl: (value: string | null) => void;
  musicVideoBase64: string | null;
  setMusicVideoBase64: (value: string | null) => void;
  musicVideoError: boolean;

  // Content Themes
  selectedThemes: string[];
  setSelectedThemes: (value: string[]) => void;
  themesError: boolean;

  // Lyrics Selection
  selectedLyricsOption: "lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null;
  setSelectedLyricsOption: (option: "lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null) => void;
  lyricsOptionError: boolean;

  // Lyrics
  lyrics: LyricsLine[];
  setLyrics: (lyrics: LyricsLine[]) => void;
  lyricsError: boolean;
  
  // Word data
  wordsData?: Array<{
    text: string;
    start: number;
    end: number;
    type: string;
    logprob?: number;
  }>;
  setWordsData: (data: Array<{
    text: string;
    start: number;
    end: number;
    type: string;
    logprob?: number;
  }> | undefined) => void;
  lyricsWithWords?: Array<{
    timestamp: number;
    text: string;
    wordIndices: number[];
  }>;
  setLyricsWithWords: (data: Array<{
    timestamp: number;
    text: string;
    wordIndices: number[];
  }> | undefined) => void;
}

export interface StepConfig {
  id: string;
  component: ComponentType<any>;
  propsSelector: (props: StepProps) => Record<string, any>;
  availableFor: ("express" | "custom")[];
}

export const STEP_CONFIGS: StepConfig[] = [
  // Step 1: Lyrics Selection (moved before Content Themes)
  {
    id: "lyrics-selection",
    component: LyricsSelection,
    propsSelector: (props) => ({
      selectedLyricsOption: props.selectedLyricsOption,
      setSelectedLyricsOption: props.setSelectedLyricsOption,
      lyricsOptionError: props.lyricsOptionError,
      hasProFeatures: props.hasProFeatures || false,
      isFirstTimeUser: props.isFirstTimeUser ?? true,
      qualifiesForFreeVideos: props.qualifiesForFreeVideos ?? false,
    }),
    availableFor: ["express", "custom"],
  },
  // Step 2: Content Themes (moved after Lyrics Selection)
  {
    id: "content-themes",
    component: ContentThemes,
    propsSelector: (props) => ({
      selectedThemes: props.selectedThemes,
      setSelectedThemes: props.setSelectedThemes,
      themesError: props.themesError,
      // pass lyrics option to control theme availability
      selectedLyricsOption: props.selectedLyricsOption,
    }),
    availableFor: ["express", "custom"],
  },
  // Step 3: Song Audio
  {
    id: "song-audio",
    component: SongAudio,
    propsSelector: (props) => ({
      songAudioUrl: props.songAudioUrl,
      setSongAudioUrl: props.setSongAudioUrl,
      songAudioBase64: props.songAudioBase64,
      setSongAudioBase64: props.setSongAudioBase64,
      songAudioError: props.songAudioError,
      selectedLyricsOption: props.selectedLyricsOption,
      lyrics: props.lyrics,
      setLyrics: props.setLyrics,
      hasProFeatures: props.hasProFeatures || false,
      isFirstTimeUser: props.isFirstTimeUser ?? true,
      wordsData: props.wordsData,
      setWordsData: props.setWordsData,
      lyricsWithWords: props.lyricsWithWords,
      setLyricsWithWords: props.setLyricsWithWords,
    }),
    availableFor: ["express", "custom"],
  },
  // Step 4: Song Details (now includes Campaign Name)
  {
    id: "song-details",
    component: SongDetails,
    propsSelector: (props) => ({
      campaignName: props.campaignName,
      setCampaignName: props.setCampaignName,
      songName: props.songName,
      setSongName: props.setSongName,
      artistName: props.artistName,
      setArtistName: props.setArtistName,
      songDetailsError: props.songDetailsError,
      campaignNameError: props.campaignNameError,
    }),
    availableFor: ["express", "custom"],
  },
  // Step 5: Genre Selection
  {
    id: "genre-selection",
    component: GenreSelection,
    propsSelector: (props) => ({
      selectedGenre: props.selectedGenre,
      setSelectedGenre: props.setSelectedGenre,
      genreError: props.genreError,
    }),
    availableFor: ["express", "custom"],
  },
  // Step 6: Video Assets (conditionally included by navigation hook)
  {
    id: "video-assets",
    component: VideoAssets,
    propsSelector: (props) => ({
      musicVideoUrl: props.musicVideoUrl,
      setMusicVideoUrl: props.setMusicVideoUrl,
      musicVideoBase64: props.musicVideoBase64,
      setMusicVideoBase64: props.setMusicVideoBase64,
      musicVideoError: props.musicVideoError,
    }),
    availableFor: ["custom"],
  },
  // Step 7: Image Assets
  {
    id: "image-assets",
    component: ImageAssets,
    propsSelector: (props) => ({
      albumArtUrl: props.albumArtUrl,
      setAlbumArtUrl: props.setAlbumArtUrl,
      albumArtBase64: props.albumArtBase64,
      setAlbumArtBase64: props.setAlbumArtBase64,
      albumArtError: props.albumArtError,
    }),
    availableFor: ["custom"],
  },
  // Step 8: Video Count
  {
    id: "video-count",
    component: VideoCount,
    propsSelector: (props) => ({
      selectedVideoCount: props.selectedVideoCount,
      setSelectedVideoCount: props.setSelectedVideoCount,
      videoCountError: props.videoCountError,
      totalCredits: props.totalCredits,
      isSubscribed: props.isSubscribed,
      isTrial: props.isTrial,
      qualifiesForFreeVideos: props.qualifiesForFreeVideos,
    }),
    availableFor: ["express", "custom"],
  },
];
