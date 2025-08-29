"use client"

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { type LyricsLine } from "@/utils/srt-converter.utils";

export function useCampaignFormState() {
  const searchParams = useSearchParams();
  
  // Form navigation state
  const [currentSection, setCurrentSection] = useState(0);
  const [campaignType, setCampaignType] = useState<"custom" | "express">("custom");
  const [isPending, setIsPending] = useState(false);

  // Campaign Info state
  const [campaignName, setCampaignName] = useState("");
  const [campaignNameError, setCampaignNameError] = useState(false);

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

  // Lyrics Selection state
  const [selectedLyricsOption, setSelectedLyricsOption] = useState<"lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null>(null);
  const [lyricsOptionError, setLyricsOptionError] = useState(false);
  
  // Lyrics state
  const [lyrics, setLyrics] = useState<LyricsLine[]>([]);
  const [lyricsError, setLyricsError] = useState(false);
  
  // Word-level data from ElevenLabs
  const [wordsData, setWordsData] = useState<Array<{
    text: string;
    start: number;
    end: number;
    type: string;
    logprob?: number;
  }> | undefined>(undefined);
  
  // Lyrics with word indices mapping
  const [lyricsWithWords, setLyricsWithWords] = useState<Array<{
    timestamp: number;
    text: string;
    wordIndices: number[];
  }> | undefined>(undefined);

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

    // Lyrics Selection
    selectedLyricsOption,
    setSelectedLyricsOption,
    lyricsOptionError,
    setLyricsOptionError,

    // Lyrics
    lyrics,
    setLyrics,
    lyricsError,
    setLyricsError,
    
    // Word data
    wordsData,
    setWordsData,
    lyricsWithWords,
    setLyricsWithWords,
  };
}