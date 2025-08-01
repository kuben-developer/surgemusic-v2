"use client"

import { CampaignInfo } from "./CampaignInfo";
import { ContentThemes } from "./ContentThemes";
import { GenreSelection } from "./GenreSelection";
import { ImageAssets } from "./ImageAssets";
import { LyricVideoOverlay } from "./LyricVideoOverlay";
import { SongAudio } from "./SongAudio";
import { SongDetails } from "./SongDetails";
import { VideoAssets } from "./VideoAssets";
import { VideoCount } from "./VideoCount";

interface StepRendererProps {
  currentSection: number;
  campaignType: "custom" | "express";
  totalCredits: number;
  isSubscribed: boolean;
  
  // Campaign Info
  campaignName: string;
  setCampaignName: (value: string) => void;
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

export function StepRenderer({
  currentSection,
  campaignType,
  totalCredits,
  isSubscribed,
  ...props
}: StepRendererProps) {
  return (
    <div className="space-y-16 mb-10">
      {currentSection === 0 && (
        <CampaignInfo
          campaignName={props.campaignName}
          setCampaignName={props.setCampaignName}
          campaignType={campaignType}
          setCampaignType={props.setCampaignType}
          campaignNameError={props.campaignNameError}
        />
      )}

      {currentSection === 1 && (
        <LyricVideoOverlay
          lyricVideoUrl={props.lyricVideoUrl}
          setLyricVideoUrl={props.setLyricVideoUrl}
          lyricVideoBase64={props.lyricVideoBase64}
          setLyricVideoBase64={props.setLyricVideoBase64}
        />
      )}

      {currentSection === 2 && (
        <GenreSelection
          selectedGenre={props.selectedGenre}
          setSelectedGenre={props.setSelectedGenre}
          genreError={props.genreError}
        />
      )}

      {currentSection === 3 && (
        <ContentThemes
          selectedGenre={props.selectedGenre}
          selectedThemes={props.selectedThemes}
          setSelectedThemes={props.setSelectedThemes}
          themesError={props.themesError}
        />
      )}

      {currentSection === 4 && (
        <SongDetails
          songName={props.songName}
          setSongName={props.setSongName}
          artistName={props.artistName}
          setArtistName={props.setArtistName}
          songDetailsError={props.songDetailsError}
        />
      )}

      {currentSection === 5 && (
        <SongAudio
          songAudioUrl={props.songAudioUrl}
          setSongAudioUrl={props.setSongAudioUrl}
          songAudioBase64={props.songAudioBase64}
          setSongAudioBase64={props.setSongAudioBase64}
          songAudioError={props.songAudioError}
        />
      )}

      {campaignType === "custom" && (
        <>
          {currentSection === 6 && (
            <VideoAssets
              musicVideoUrl={props.musicVideoUrl}
              setMusicVideoUrl={props.setMusicVideoUrl}
              musicVideoBase64={props.musicVideoBase64}
              setMusicVideoBase64={props.setMusicVideoBase64}
              musicVideoError={props.musicVideoError}
            />
          )}

          {currentSection === 7 && (
            <ImageAssets
              albumArtUrl={props.albumArtUrl}
              setAlbumArtUrl={props.setAlbumArtUrl}
              albumArtBase64={props.albumArtBase64}
              setAlbumArtBase64={props.setAlbumArtBase64}
              albumArtError={props.albumArtError}
            />
          )}
        </>
      )}

      {/* Video Count is always the last step */}
      {currentSection === (campaignType === "custom" ? 8 : 6) && (
        <VideoCount
          selectedVideoCount={props.selectedVideoCount}
          setSelectedVideoCount={props.setSelectedVideoCount}
          videoCountError={props.videoCountError}
          totalCredits={totalCredits}
          isSubscribed={isSubscribed}
        />
      )}
    </div>
  );
}