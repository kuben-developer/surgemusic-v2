import type { ComponentType } from "react";
import { CampaignInfo } from "./CampaignInfo";
import { ContentThemes } from "./ContentThemes";
import { GenreSelection } from "./GenreSelection";
import { ImageAssets } from "./ImageAssets";
import { LyricVideoOverlay } from "./LyricVideoOverlay";
import { SongAudio } from "./SongAudio";
import { SongDetails } from "./SongDetails";
import { VideoAssets } from "./VideoAssets";
import { VideoCount } from "./VideoCount";

export interface StepProps {
  // Campaign Info
  campaignName: string;
  setCampaignName: (value: string) => void;
  campaignType: "custom" | "express";
  setCampaignType: (value: "custom" | "express") => void;
  campaignNameError: boolean;

  // Lyric Video Overlay
  lyricVideoUrl: string | null;
  setLyricVideoUrl: (value: string | null) => void;
  lyricVideoBase64: string | null;
  setLyricVideoBase64: (value: string | null) => void;

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
  selectedGenre: "rap" | "electronic" | "pop" | "other" | null;
  setSelectedGenre: (value: "rap" | "electronic" | "pop" | "other" | null) => void;
  genreError: boolean;

  // Video Count
  selectedVideoCount: number | null;
  setSelectedVideoCount: (value: number | null) => void;
  videoCountError: boolean;
  totalCredits: number;
  isSubscribed: boolean;

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
}

export interface StepConfig {
  id: string;
  component: ComponentType<any>;
  propsSelector: (props: StepProps) => Record<string, any>;
  availableFor: ("express" | "custom")[];
}

export const STEP_CONFIGS: StepConfig[] = [
  {
    id: "campaign-info",
    component: CampaignInfo,
    propsSelector: (props) => ({
      campaignName: props.campaignName,
      setCampaignName: props.setCampaignName,
      campaignType: props.campaignType,
      setCampaignType: props.setCampaignType,
      campaignNameError: props.campaignNameError,
    }),
    availableFor: ["express", "custom"],
  },
  {
    id: "lyric-video-overlay",
    component: LyricVideoOverlay,
    propsSelector: (props) => ({
      lyricVideoUrl: props.lyricVideoUrl,
      setLyricVideoUrl: props.setLyricVideoUrl,
      lyricVideoBase64: props.lyricVideoBase64,
      setLyricVideoBase64: props.setLyricVideoBase64,
    }),
    availableFor: ["express", "custom"],
  },
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
  {
    id: "content-themes",
    component: ContentThemes,
    propsSelector: (props) => ({
      selectedGenre: props.selectedGenre,
      selectedThemes: props.selectedThemes,
      setSelectedThemes: props.setSelectedThemes,
      themesError: props.themesError,
    }),
    availableFor: ["express", "custom"],
  },
  {
    id: "song-details",
    component: SongDetails,
    propsSelector: (props) => ({
      songName: props.songName,
      setSongName: props.setSongName,
      artistName: props.artistName,
      setArtistName: props.setArtistName,
      songDetailsError: props.songDetailsError,
    }),
    availableFor: ["express", "custom"],
  },
  {
    id: "song-audio",
    component: SongAudio,
    propsSelector: (props) => ({
      songAudioUrl: props.songAudioUrl,
      setSongAudioUrl: props.setSongAudioUrl,
      songAudioBase64: props.songAudioBase64,
      setSongAudioBase64: props.setSongAudioBase64,
      songAudioError: props.songAudioError,
    }),
    availableFor: ["express", "custom"],
  },
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
  {
    id: "video-count",
    component: VideoCount,
    propsSelector: (props) => ({
      selectedVideoCount: props.selectedVideoCount,
      setSelectedVideoCount: props.setSelectedVideoCount,
      videoCountError: props.videoCountError,
      totalCredits: props.totalCredits,
      isSubscribed: props.isSubscribed,
    }),
    availableFor: ["express", "custom"],
  },
];