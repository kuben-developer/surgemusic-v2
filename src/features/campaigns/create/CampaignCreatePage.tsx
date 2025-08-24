"use client"

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { NavigationControls } from "./components/NavigationControls";
import { StepRenderer } from "./components/StepRenderer";
import { useCampaignForm } from "./hooks/useCampaignForm";

export default function CampaignCreatePage() {
  const formData = useCampaignForm();

  // Fetch user data
  const userData = useQuery(api.app.users.getCurrentUser);
  const totalCredits = (userData?.videoGenerationCredit ?? 0) + (userData?.videoGenerationAdditionalCredit ?? 0);
  const isSubscribed = Boolean(userData?.subscriptionPriceId);

  return (
    <div className="container max-w-5xl mx-auto py-12">
      {/* Progress indicator */}
      <ProgressIndicator
        sections={formData.sections}
        currentSection={formData.currentSection}
      />

      {/* Navigation Buttons */}
      <NavigationControls
        sections={formData.sections}
        currentSection={formData.currentSection}
        isPending={formData.isPending}
        onPrevious={formData.handlePrevious}
        onNext={formData.handleNext}
        onGenerate={formData.handleGenerateVideos}
      />

      {/* Render current section */}
      <StepRenderer
        currentSection={formData.currentSection}
        campaignType={formData.campaignType}
        totalCredits={totalCredits}
        isSubscribed={isSubscribed}
        
        // Campaign Info
        campaignName={formData.campaignName}
        setCampaignName={formData.setCampaignName}
        setCampaignType={formData.setCampaignType}
        campaignNameError={formData.campaignNameError}

        // Song Details
        songName={formData.songName}
        setSongName={formData.setSongName}
        artistName={formData.artistName}
        setArtistName={formData.setArtistName}
        songDetailsError={formData.songDetailsError}

        // Song Audio
        songAudioUrl={formData.songAudioUrl}
        setSongAudioUrl={formData.setSongAudioUrl}
        songAudioBase64={formData.songAudioBase64}
        setSongAudioBase64={formData.setSongAudioBase64}
        songAudioError={formData.songAudioError}

        // Genre
        selectedGenre={formData.selectedGenre}
        setSelectedGenre={formData.setSelectedGenre}
        genreError={formData.genreError}

        // Video Count
        selectedVideoCount={formData.selectedVideoCount}
        setSelectedVideoCount={formData.setSelectedVideoCount}
        videoCountError={formData.videoCountError}

        // Image Assets
        albumArtUrl={formData.albumArtUrl}
        setAlbumArtUrl={formData.setAlbumArtUrl}
        albumArtBase64={formData.albumArtBase64}
        setAlbumArtBase64={formData.setAlbumArtBase64}
        albumArtError={formData.albumArtError}

        // Video Assets
        musicVideoUrl={formData.musicVideoUrl}
        setMusicVideoUrl={formData.setMusicVideoUrl}
        musicVideoBase64={formData.musicVideoBase64}
        setMusicVideoBase64={formData.setMusicVideoBase64}
        musicVideoError={formData.musicVideoError}

        // Content Themes
        selectedThemes={formData.selectedThemes}
        setSelectedThemes={formData.setSelectedThemes}
        themesError={formData.themesError}

        // Lyrics
        lyrics={formData.lyrics}
        setLyrics={formData.setLyrics}
        lyricsError={formData.lyricsError}
      />
    </div>
  );
}