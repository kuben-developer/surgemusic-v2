import { toast } from "sonner";

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

    if (!state.musicVideoUrl) {
      setMusicVideoError(true);
      toast.error("Music Video Required", {
        description: "Please upload a music video clip or performance video",
      });
      isValid = false;
    }

    if (state.selectedThemes.length === 0) {
      setThemesError(true);
      toast.error("Content Themes Required", {
        description: "Please select at least one content theme",
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