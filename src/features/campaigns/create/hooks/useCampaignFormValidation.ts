import { toast } from "sonner";
import { hasProAccess } from "../utils/pro-access.utils";

interface ValidationState {
  campaignName: string;
  songName: string;
  artistName: string;
  songAudioUrl: string | null;
  selectedGenre: string | null;
  selectedVideoCount: number | null;
  albumArtUrl: string | null;
  musicVideoUrl: string | null;
  selectedThemes: string[];
  campaignType: "custom" | "express";
  selectedLyricsOption: "lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null;
  subscriptionPriceId?: string;
  isTrial?: boolean;
}

interface ErrorSetters {
  setCampaignNameError: (value: boolean) => void;
  setSongDetailsError: (value: boolean) => void;
  setSongAudioError: (value: boolean) => void;
  setGenreError: (value: boolean) => void;
  setVideoCountError: (value: boolean) => void;
  setAlbumArtError: (value: boolean) => void;
  setMusicVideoError: (value: boolean) => void;
  setThemesError: (value: boolean) => void;
  setLyricsOptionError: (value: boolean) => void;
}

export function useCampaignFormValidation(state: ValidationState, errorSetters: ErrorSetters) {
  const {
    setCampaignNameError,
    setSongDetailsError,
    setSongAudioError,
    setGenreError,
    setVideoCountError,
    setAlbumArtError,
    setMusicVideoError,
    setThemesError,
    setLyricsOptionError,
  } = errorSetters;

  const resetAllErrors = () => {
    setCampaignNameError(false);
    setSongDetailsError(false);
    setSongAudioError(false);
    setGenreError(false);
    setVideoCountError(false);
    setAlbumArtError(false);
    setMusicVideoError(false);
    setThemesError(false);
    setLyricsOptionError(false);
  };

  const validateCampaignName = () => {
    if (!state.campaignName.trim()) {
      setCampaignNameError(true);
      toast.error("Campaign Name Required", {
        description: "Please enter a name for your campaign",
      });
      return false;
    }
    return true;
  };

  const validateSongDetails = () => {
    if (!state.songName.trim() || !state.artistName.trim()) {
      setSongDetailsError(true);
      toast.error("Song Details Required", {
        description: "Please enter both song name and artist name",
      });
      return false;
    }
    return true;
  };

  const validateSongAudio = () => {
    if (!state.songAudioUrl) {
      setSongAudioError(true);
      toast.error("Song Audio Required", {
        description: "Please upload your song audio",
      });
      return false;
    }
    return true;
  };

  const validateGenre = () => {
    if (!state.selectedGenre) {
      setGenreError(true);
      toast.error("Genre Required", {
        description: "Please select a genre for your music",
      });
      return false;
    }
    return true;
  };

  const validateVideoCount = () => {
    if (!state.selectedVideoCount) {
      setVideoCountError(true);
      toast.error("Video Count Required", {
        description: "Please select the number of videos you want to generate",
      });
      return false;
    }
    return true;
  };

  const validateLyricsOption = () => {
    if (!state.selectedLyricsOption) {
      setLyricsOptionError(true);
      toast.error("Lyrics Option Required", {
        description: "Please select how you want lyrics and captions to appear",
      });
      return false;
    }
    
    // Check if Pro option selected without Pro access
    const hasProFeatures = hasProAccess(state.subscriptionPriceId, state.isTrial || false);
    if ((state.selectedLyricsOption === "lyrics" || state.selectedLyricsOption === "lyrics-hooks") && !hasProFeatures) {
      setLyricsOptionError(true);
      toast.error("Pro Features Required", {
        description: "This feature requires a Free Trial or Growth plan (or above)",
      });
      return false;
    }
    
    return true;
  };

  const validateCustomCampaignAssets = () => {
    if (state.campaignType !== "custom") return true;

    let isValid = true;

    if (!state.albumArtUrl) {
      setAlbumArtError(true);
      toast.error("Album Art Required", {
        description: "Please upload your album/single artwork",
      });
      isValid = false;
    }

    // Only require music video when the 'reactions' theme is selected
    const requiresMusicVideo = state.selectedThemes.includes("reactions");
    if (requiresMusicVideo && !state.musicVideoUrl) {
      setMusicVideoError(true);
      toast.error("Music Video Required", {
        description: "Please upload a music video/performance clip for reactions content",
      });
      isValid = false;
    }

    if (state.selectedThemes.length === 0) {
      setThemesError(true);
      toast.error("Content Themes Required", {
        description: "Please select at least one content theme",
      });
      isValid = false;
    } else if (state.selectedThemes.length > 3) {
      setThemesError(true);
      toast.error("Too Many Themes Selected", {
        description: "You can only select up to 3 content themes. Please unselect some themes.",
      });
      isValid = false;
    }

    return isValid;
  };

  const validateForm = () => {
    resetAllErrors();

    const validations = [
      validateCampaignName(),
      validateSongDetails(),
      validateLyricsOption(),
      validateSongAudio(),
      validateGenre(),
      validateVideoCount(),
      validateCustomCampaignAssets(),
    ];

    return validations.every(Boolean);
  };

  return {
    validateForm,
    resetAllErrors,
  };
}
