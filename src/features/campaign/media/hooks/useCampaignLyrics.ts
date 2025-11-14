"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { initializeEmptyLyrics, parseSRT } from "@/utils/srt-converter.utils";
import { generateWordLevelSRT, generateEstimatedSRT, convertSRTToFile } from "@/utils/srt-generator.utils";
import { parseWordLevelDataFromSRT } from "@/utils/srt-parser.utils";
import { useConvexUpload } from "@/hooks/useConvexUpload";
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
  const updateLyricsMutation = useMutation(api.app.campaignAssets.updateLyrics);
  const { uploadFile } = useConvexUpload();

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
      let srtFileId = undefined;
      let srtUrl = undefined;

      // Generate and upload SRT file
      let srtContent: string;

      if (wordsData && wordsData.length > 0) {
        // Generate word-level SRT from transcription data
        srtContent = generateWordLevelSRT(wordsData);
      } else {
        // Generate estimated SRT from lyrics text
        const lyricsText = editedLyrics.map((line) => line.text).join(" ");
        srtContent = generateEstimatedSRT(lyricsText);
      }

      // Convert to File and upload
      const srtFile = convertSRTToFile(srtContent, `campaign-${campaignId}.srt`);
      const uploadResult = await uploadFile(srtFile);

      if (uploadResult) {
        srtFileId = uploadResult.storageId;
        srtUrl = uploadResult.publicUrl;
      }

      // Save lyrics and SRT reference to database
      await updateLyricsMutation({
        campaignId,
        lyrics: editedLyrics,
        wordsData,
        lyricsWithWords,
        srtFileId,
        srtUrl,
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

  /**
   * Upload and parse SRT file
   */
  const handleUploadSRT = async (file: File) => {
    try {
      const text = await file.text();
      const parsedLyrics = parseSRT(text);

      if (parsedLyrics.length === 0) {
        toast.error("Failed to parse SRT file", {
          description: "The file appears to be empty or invalid",
        });
        return;
      }

      // Parse word-level data from SRT for precise timing
      const parsedWordsData = parseWordLevelDataFromSRT(text);
      if (parsedWordsData.length > 0) {
        setWordsData(parsedWordsData);
      }

      // Upload the SRT file to storage
      const uploadResult = await uploadFile(file);
      if (uploadResult) {
        // Store SRT file reference for later use
        console.log("SRT file uploaded:", uploadResult.publicUrl);
      }

      // Normalize to 15 seconds by taking first 15 entries or filling with empty
      const normalizedLyrics: LyricLine[] = [];
      for (let i = 0; i < 15; i++) {
        normalizedLyrics.push({
          timestamp: i,
          text: parsedLyrics[i]?.text || "",
        });
      }

      setLyrics(normalizedLyrics);
      setShowLyricsEditor(true);
      toast.success("SRT file loaded successfully");
    } catch (error) {
      console.error("SRT upload error:", error);
      toast.error("Failed to upload SRT file", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
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
    handleUploadSRT,
    openLyricsEditor,
    closeLyricsEditor,
    setLyrics,
  };
}
