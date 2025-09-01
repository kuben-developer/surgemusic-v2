"use client"

import { useMemo } from "react";

interface FormErrors {
  campaignNameError: boolean;
  songDetailsError: boolean;
  songAudioError: boolean;
  genreError: boolean;
  videoCountError: boolean;
  albumArtError: boolean;
  musicVideoError: boolean;
  themesError: boolean;
  lyricsOptionError: boolean;
}

interface SectionsProps {
  campaignType: "custom" | "express";
  errors: FormErrors;
  selectedThemes?: string[]; // used to conditionally show Video Assets
}

export function useCampaignFormSections({ campaignType, errors, selectedThemes = [] }: SectionsProps) {
  const sections = useMemo(() => {
    const baseSections = [
      { title: "Content Themes", error: errors.themesError },
      { title: "Content Appearance", error: errors.lyricsOptionError },
      { title: "Song Audio", error: errors.songAudioError },
      { title: "Song & Campaign Details", error: errors.songDetailsError },
      { title: "Genre Selection", error: errors.genreError },
    ];

    // Add custom sections for campaign type
    if (campaignType === "custom") {
      // Only show Video Assets if the reactions theme was selected in step 1
      const hasReactions = selectedThemes.includes("reactions");
      if (hasReactions) {
        baseSections.push({ title: "Video Assets", error: errors.musicVideoError });
      }
    }

    baseSections.push({ title: "Image Assets", error: errors.albumArtError });
    baseSections.push({ title: "Video Count", error: errors.videoCountError });

    return baseSections;
  }, [campaignType, errors, selectedThemes]);

  return { sections };
}
