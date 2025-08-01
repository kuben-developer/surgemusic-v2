"use client"

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function useCampaignFormState() {
  const searchParams = useSearchParams();
  
  // Form navigation state
  const [currentSection, setCurrentSection] = useState(0);
  const [campaignType, setCampaignType] = useState<"custom" | "express">("custom");
  const [isPending, setIsPending] = useState(false);

  // Campaign Info state
  const [campaignName, setCampaignName] = useState("");
  const [campaignNameError, setCampaignNameError] = useState(false);

  // Lyric Video Overlay state
  const [lyricVideoUrl, setLyricVideoUrl] = useState<string | null>(null);
  const [lyricVideoBase64, setLyricVideoBase64] = useState<string | null>(null);

  // Song Details state
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [songDetailsError, setSongDetailsError] = useState(false);

  // Song Audio state
  const [songAudioUrl, setSongAudioUrl] = useState<string | null>(() => {
    const audioUrl = searchParams.get('songAudioUrl');
    return audioUrl ? decodeURIComponent(audioUrl) : null;
  });
  const [songAudioBase64, setSongAudioBase64] = useState<string | null>(null);
  const [songAudioError, setSongAudioError] = useState(false);

  // Genre state
  const [selectedGenre, setSelectedGenre] = useState<"rap" | "electronic" | "pop" | "other" | null>(null);
  const [genreError, setGenreError] = useState(false);

  // Video Count state
  const [selectedVideoCount, setSelectedVideoCount] = useState<number | null>(null);
  const [videoCountError, setVideoCountError] = useState(false);

  // Image Assets state
  const [albumArtUrl, setAlbumArtUrl] = useState<string | null>(null);
  const [albumArtBase64, setAlbumArtBase64] = useState<string | null>(null);
  const [albumArtError, setAlbumArtError] = useState(false);

  // Video Assets state
  const [musicVideoUrl, setMusicVideoUrl] = useState<string | null>(null);
  const [musicVideoBase64, setMusicVideoBase64] = useState<string | null>(null);
  const [musicVideoError, setMusicVideoError] = useState(false);

  // Content Themes state
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [themesError, setThemesError] = useState(false);

  return {
    // Form navigation
    currentSection,
    setCurrentSection,
    campaignType,
    setCampaignType,
    isPending,
    setIsPending,

    // Campaign Info
    campaignName,
    setCampaignName,
    campaignNameError,
    setCampaignNameError,

    // Lyric Video Overlay
    lyricVideoUrl,
    setLyricVideoUrl,
    lyricVideoBase64,
    setLyricVideoBase64,

    // Song Details
    songName,
    setSongName,
    artistName,
    setArtistName,
    songDetailsError,
    setSongDetailsError,

    // Song Audio
    songAudioUrl,
    setSongAudioUrl,
    songAudioBase64,
    setSongAudioBase64,
    songAudioError,
    setSongAudioError,

    // Genre
    selectedGenre,
    setSelectedGenre,
    genreError,
    setGenreError,

    // Video Count
    selectedVideoCount,
    setSelectedVideoCount,
    videoCountError,
    setVideoCountError,

    // Image Assets
    albumArtUrl,
    setAlbumArtUrl,
    albumArtBase64,
    setAlbumArtBase64,
    albumArtError,
    setAlbumArtError,

    // Video Assets
    musicVideoUrl,
    setMusicVideoUrl,
    musicVideoBase64,
    setMusicVideoBase64,
    musicVideoError,
    setMusicVideoError,

    // Content Themes
    selectedThemes,
    setSelectedThemes,
    themesError,
    setThemesError,
  };
}