"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { initializeEmptyLyrics } from "@/utils/srt-converter.utils";
import type { LyricLine, WordData, LyricWithWords } from "../types/media.types";

export function useCampaignLyrics(campaignId: string, audioUrl?: string) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [wordsData, setWordsData] = useState<WordData[] | undefined>(undefined);
  const [lyricsWithWords, setLyricsWithWords] = useState<LyricWithWords[] | undefined>(undefined);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionFailed, setTranscriptionFailed] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [showLyricsEditor, setShowLyricsEditor] = useState(false);

  const transcribeAudioAction = useAction(api.app.transcription.transcribeAudio);
  const updateLyricsMutation = useMutation(api.app.airtableCampaignsMedia.updateLyrics);

  /**
   * Transcribe audio using ElevenLabs
   */
  const handleTranscribe = async () => {
    if (!audioUrl) {
      toast.error("No audio to transcribe");
      return;
    }

    setIsTranscribing(true);
    setTranscriptionFailed(false);
    setTranscriptionError(null);

    try {
      console.log("Starting transcription for URL:", audioUrl);
      const result = await transcribeAudioAction({ audioUrl });
      console.log("Transcription result:", result);

      if (result.success && result.lyrics && result.lyrics.length > 0) {
        setLyrics(result.lyrics);

        // Save word-level data if available
        if (result.wordsData) {
          setWordsData(result.wordsData);
        }
        if (result.lyricsWithWords) {
          setLyricsWithWords(result.lyricsWithWords);
        }

        setShowLyricsEditor(true);
        toast.success("Audio transcribed successfully");
      } else {
        console.error("Transcription failed:", result.error);
        setTranscriptionFailed(true);
        setTranscriptionError(result.error || "Transcription failed.");
        toast.error("Transcription failed", {
          description: "We tried three times on the server. You can retry or edit manually.",
        });

        // Prepare empty lyrics so user can still open the editor manually
        if (!lyrics || lyrics.length === 0) {
          setLyrics(initializeEmptyLyrics(15));
        }
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setTranscriptionFailed(true);
      setTranscriptionError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to transcribe audio", {
        description: "We tried three times on the server. You can retry or edit manually.",
      });

      // Prepare empty lyrics so user can still open the editor manually
      if (!lyrics || lyrics.length === 0) {
        setLyrics(initializeEmptyLyrics(15));
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  /**
   * Save edited lyrics to database
   */
  const handleSaveLyrics = async (editedLyrics: LyricLine[]) => {
    try {
      await updateLyricsMutation({
        campaignId,
        lyrics: editedLyrics,
        wordsData,
        lyricsWithWords,
      });

      setLyrics(editedLyrics);
      toast.success("Lyrics saved successfully");
      setShowLyricsEditor(false);
    } catch (error) {
      toast.error("Failed to save lyrics");
      throw error;
    }
  };

  /**
   * Open lyrics editor manually (for manual entry)
   */
  const openLyricsEditor = () => {
    if (lyrics.length === 0) {
      setLyrics(initializeEmptyLyrics(15));
    }
    setShowLyricsEditor(true);
  };

  /**
   * Close lyrics editor
   */
  const closeLyricsEditor = () => {
    setShowLyricsEditor(false);
  };

  return {
    lyrics,
    wordsData,
    lyricsWithWords,
    isTranscribing,
    transcriptionFailed,
    transcriptionError,
    showLyricsEditor,
    handleTranscribe,
    handleSaveLyrics,
    openLyricsEditor,
    closeLyricsEditor,
    setLyrics,
  };
}
