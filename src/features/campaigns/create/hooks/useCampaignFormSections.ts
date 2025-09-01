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
}

export function useCampaignFormSections({ campaignType, errors }: SectionsProps) {
  const sections = useMemo(() => {
    const baseSections = [
      { title: "Content Themes", error: errors.themesError },
      { title: "Content Appearance", error: errors.lyricsOptionError },
      { title: "Campaign Info", error: errors.campaignNameError },
      { title: "Genre Selection", error: errors.genreError },
      { title: "Song Details", error: errors.songDetailsError },
      { title: "Song Audio", error: errors.songAudioError },
    ];

    // Add custom sections for campaign type
    if (campaignType === "custom") {
      baseSections.push(
        { title: "Video Assets", error: errors.musicVideoError },
        { title: "Image Assets", error: errors.albumArtError },
      );
    }

    baseSections.push({ title: "Video Count", error: errors.videoCountError });

    return baseSections;
  }, [campaignType, errors]);

  return { sections };
}
