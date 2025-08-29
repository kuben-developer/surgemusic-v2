import { useCampaignFormState } from "./useCampaignFormState";
import { useCampaignFormValidation } from "./useCampaignFormValidation";
import { useCampaignFormNavigation } from "./useCampaignFormNavigation";
import { useCampaignFormSections } from "./useCampaignFormSections";
import { useCampaignFormSubmission } from "./useCampaignFormSubmission";

export type { CreateCampaignData } from "./useCampaignFormSubmission";

interface UseCampaignFormProps {
  subscriptionPriceId?: string;
  isTrial: boolean;
}

export function useCampaignForm({ subscriptionPriceId, isTrial }: UseCampaignFormProps) {
  // Use the state management hook
  const state = useCampaignFormState();

  // Use the sections hook
  const { sections } = useCampaignFormSections({
    campaignType: state.campaignType,
    errors: {
      campaignNameError: state.campaignNameError,
      songDetailsError: state.songDetailsError,
      songAudioError: state.songAudioError,
      genreError: state.genreError,
      videoCountError: state.videoCountError,
      albumArtError: state.albumArtError,
      musicVideoError: state.musicVideoError,
      themesError: state.themesError,
      lyricsOptionError: state.lyricsOptionError,
    },
  });

  // Use the validation hook
  const { validateForm } = useCampaignFormValidation(
    {
      campaignName: state.campaignName,
      songName: state.songName,
      artistName: state.artistName,
      songAudioUrl: state.songAudioUrl,
      selectedGenre: state.selectedGenre,
      selectedVideoCount: state.selectedVideoCount,
      albumArtUrl: state.albumArtUrl,
      musicVideoUrl: state.musicVideoUrl,
      selectedThemes: state.selectedThemes,
      campaignType: state.campaignType,
      selectedLyricsOption: state.selectedLyricsOption,
      subscriptionPriceId,
      isTrial,
    },
    {
      setCampaignNameError: state.setCampaignNameError,
      setSongDetailsError: state.setSongDetailsError,
      setSongAudioError: state.setSongAudioError,
      setGenreError: state.setGenreError,
      setVideoCountError: state.setVideoCountError,
      setAlbumArtError: state.setAlbumArtError,
      setMusicVideoError: state.setMusicVideoError,
      setThemesError: state.setThemesError,
      setLyricsOptionError: state.setLyricsOptionError,
    }
  );

  // Use the navigation hook
  const { handleNext, handlePrevious } = useCampaignFormNavigation({
    currentSection: state.currentSection,
    setCurrentSection: state.setCurrentSection,
    sections,
  });

  // Use the submission hook
  const { createCampaign } = useCampaignFormSubmission({
    setIsPending: state.setIsPending,
  });

  const handleGenerateVideos = () => {
    if (validateForm()) {
      if (!(state.selectedVideoCount && state.selectedGenre && state.selectedLyricsOption)) {
        return;
      }
      
      // Map selectedLyricsOption to hasLyrics and hasCaptions
      let hasLyrics = false;
      let hasCaptions = false;
      
      switch (state.selectedLyricsOption) {
        case "lyrics":
          hasLyrics = true;
          hasCaptions = false;
          break;
        case "lyrics-hooks":
          hasLyrics = true;
          hasCaptions = true;
          break;
        case "hooks":
          hasLyrics = false;
          hasCaptions = true;
          break;
        case "video-only":
          hasLyrics = false;
          hasCaptions = false;
          break;
      }
      
      createCampaign({
        campaignName: state.campaignName,
        songName: state.songName,
        artistName: state.artistName,
        campaignCoverImageUrl: state.albumArtUrl || undefined,
        videoCount: state.selectedVideoCount,
        genre: state.selectedGenre,
        themes: state.selectedThemes,
        songAudioUrl: state.songAudioUrl || undefined,
        musicVideoUrl: state.musicVideoUrl || undefined,
        hasLyrics,
        hasCaptions,
        lyrics: state.lyrics,
        wordsData: state.wordsData,
        lyricsWithWords: state.lyricsWithWords,
      });
    }
  };

  return {
    // Form state
    currentSection: state.currentSection,
    campaignType: state.campaignType,
    setCampaignType: state.setCampaignType,
    isPending: state.isPending,
    sections,

    // Campaign Info
    campaignName: state.campaignName,
    setCampaignName: state.setCampaignName,
    campaignNameError: state.campaignNameError,

    // Song Details
    songName: state.songName,
    setSongName: state.setSongName,
    artistName: state.artistName,
    setArtistName: state.setArtistName,
    songDetailsError: state.songDetailsError,

    // Song Audio
    songAudioUrl: state.songAudioUrl,
    setSongAudioUrl: state.setSongAudioUrl,
    songAudioBase64: state.songAudioBase64,
    setSongAudioBase64: state.setSongAudioBase64,
    songAudioError: state.songAudioError,

    // Genre
    selectedGenre: state.selectedGenre,
    setSelectedGenre: state.setSelectedGenre,
    genreError: state.genreError,

    // Video Count
    selectedVideoCount: state.selectedVideoCount,
    setSelectedVideoCount: state.setSelectedVideoCount,
    videoCountError: state.videoCountError,

    // Image Assets
    albumArtUrl: state.albumArtUrl,
    setAlbumArtUrl: state.setAlbumArtUrl,
    albumArtBase64: state.albumArtBase64,
    setAlbumArtBase64: state.setAlbumArtBase64,
    albumArtError: state.albumArtError,

    // Video Assets
    musicVideoUrl: state.musicVideoUrl,
    setMusicVideoUrl: state.setMusicVideoUrl,
    musicVideoBase64: state.musicVideoBase64,
    setMusicVideoBase64: state.setMusicVideoBase64,
    musicVideoError: state.musicVideoError,

    // Content Themes
    selectedThemes: state.selectedThemes,
    setSelectedThemes: state.setSelectedThemes,
    themesError: state.themesError,

    // Lyrics Selection
    selectedLyricsOption: state.selectedLyricsOption,
    setSelectedLyricsOption: state.setSelectedLyricsOption,
    lyricsOptionError: state.lyricsOptionError,

    // Lyrics
    lyrics: state.lyrics,
    setLyrics: state.setLyrics,
    lyricsError: state.lyricsError,
    
    // Word data
    wordsData: state.wordsData,
    setWordsData: state.setWordsData,
    lyricsWithWords: state.lyricsWithWords,
    setLyricsWithWords: state.setLyricsWithWords,

    // Actions
    handleNext,
    handlePrevious,
    handleGenerateVideos,
  };
}