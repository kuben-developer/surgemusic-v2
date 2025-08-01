import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";

export interface CreateCampaignData {
  campaignName: string;
  songName: string;
  artistName: string;
  campaignCoverImageUrl?: string;
  videoCount: number;
  genre: string;
  themes: string[];
  songAudioUrl?: string;
  musicVideoUrl?: string;
  lyricVideoUrl?: string;
}

export function useCampaignForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Form state
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

  const createCampaignMutation = useMutation(api.campaigns.create);

  // Define sections array for navigation
  const sections = [
    { title: "Campaign Info", error: campaignNameError },
    { title: "Lyric Video Overlay", error: false },
    { title: "Genre Selection", error: genreError },
    { title: "Content Themes", error: themesError },
    { title: "Song Details", error: songDetailsError },
    { title: "Song Audio", error: songAudioError },
  ];

  // Add custom sections for campaign type
  if (campaignType === "custom") {
    sections.push(
      { title: "Video Assets", error: musicVideoError },
      { title: "Image Assets", error: albumArtError },
    );
  }

  sections.push({ title: "Video Count", error: videoCountError });

  const validateForm = () => {
    // Reset all error states
    setCampaignNameError(false);
    setSongDetailsError(false);
    setSongAudioError(false);
    setGenreError(false);
    setVideoCountError(false);
    setAlbumArtError(false);
    setMusicVideoError(false);
    setThemesError(false);

    if (!campaignName.trim()) {
      setCampaignNameError(true);
      toast.error("Campaign Name Required", {
        description: "Please enter a name for your campaign",
      });
      return false;
    }

    if (!songName.trim() || !artistName.trim()) {
      setSongDetailsError(true);
      toast.error("Song Details Required", {
        description: "Please enter both song name and artist name",
      });
      return false;
    }

    if (!songAudioUrl) {
      setSongAudioError(true);
      toast.error("Song Audio Required", {
        description: "Please upload your song audio",
      });
      return false;
    }

    if (!selectedGenre) {
      setGenreError(true);
      toast.error("Genre Required", {
        description: "Please select a genre for your music",
      });
      return false;
    }

    if (!selectedVideoCount) {
      setVideoCountError(true);
      toast.error("Video Count Required", {
        description: "Please select the number of videos you want to generate",
      });
      return false;
    }

    if (campaignType === "custom") {
      if (!albumArtUrl) {
        setAlbumArtError(true);
        toast.error("Album Art Required", {
          description: "Please upload your album/single artwork",
        });
        return false;
      }

      if (!musicVideoUrl) {
        setMusicVideoError(true);
        toast.error("Music Video Required", {
          description: "Please upload a music video clip or performance video",
        });
        return false;
      }

      if (selectedThemes.length === 0) {
        setThemesError(true);
        toast.error("Content Themes Required", {
          description: "Please select at least one content theme",
        });
        return false;
      }
    }

    return true;
  };

  const createCampaign = async (data: CreateCampaignData) => {
    setIsPending(true);
    try {
      const campaignId = await createCampaignMutation(data);
      router.push(`/campaign/${campaignId}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    } finally {
      setIsPending(false);
    }
  };

  const handleGenerateVideos = () => {
    if (validateForm()) {
      if (!(selectedVideoCount && selectedGenre)) {
        return;
      }
      createCampaign({
        campaignName,
        songName,
        artistName,
        campaignCoverImageUrl: albumArtUrl || undefined,
        videoCount: selectedVideoCount,
        genre: selectedGenre,
        themes: selectedThemes,
        songAudioUrl: songAudioUrl || undefined,
        musicVideoUrl: musicVideoUrl || undefined,
        lyricVideoUrl: lyricVideoUrl || undefined,
      });
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    // Form state
    currentSection,
    campaignType,
    setCampaignType,
    isPending,
    sections,

    // Campaign Info
    campaignName,
    setCampaignName,
    campaignNameError,

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

    // Song Audio
    songAudioUrl,
    setSongAudioUrl,
    songAudioBase64,
    setSongAudioBase64,
    songAudioError,

    // Genre
    selectedGenre,
    setSelectedGenre,
    genreError,

    // Video Count
    selectedVideoCount,
    setSelectedVideoCount,
    videoCountError,

    // Image Assets
    albumArtUrl,
    setAlbumArtUrl,
    albumArtBase64,
    setAlbumArtBase64,
    albumArtError,

    // Video Assets
    musicVideoUrl,
    setMusicVideoUrl,
    musicVideoBase64,
    setMusicVideoBase64,
    musicVideoError,

    // Content Themes
    selectedThemes,
    setSelectedThemes,
    themesError,

    // Actions
    handleNext,
    handlePrevious,
    handleGenerateVideos,
  };
}