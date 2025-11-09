"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useConvexUpload } from "@/hooks/useConvexUpload";
import { convertVideoToAudio } from "@/utils/media-converter.utils";
import { getAudioDuration } from "@/utils/audio-trimmer.utils";

export function useCampaignAudio(campaignId: string) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedAudioFile, setProcessedAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);

  const updateMediaMutation = useMutation(api.app.airtableCampaignsMedia.updateAudioAndLyrics);
  const removeMediaMutation = useMutation(api.app.airtableCampaignsMedia.removeAudioAndLyrics);

  const { uploadFile, fileToBase64, isUploading, uploadProgress } = useConvexUpload({
    fileType: "audio",
    trackUpload: true,
    onSuccess: async (result) => {
      // Save to airtableCampaigns
      await updateMediaMutation({
        campaignId,
        audioFileId: result.storageId,
        audioUrl: result.publicUrl,
      });

      toast.success("15-second audio clip uploaded successfully");

      // Reset states
      setSelectedFile(null);
      setProcessedAudioFile(null);
      setShowTrimmer(false);
      setAudioBase64(null);
    },
    onError: (error) => {
      toast.error("Failed to upload audio", {
        description: error.message,
      });
    },
  });

  /**
   * Handle file selection (audio or video)
   */
  const handleFileSelect = async (file: File) => {
    const isAudio = file.type.startsWith("audio/");
    const isVideo = file.type.startsWith("video/");

    if (!isAudio && !isVideo) {
      toast.error("Invalid file type", {
        description: "Please upload an audio file (MP3, WAV) or video file",
      });
      return;
    }

    // Validate file size (32MB for audio, 128MB for video)
    const maxSize = isVideo ? 128 * 1024 * 1024 : 32 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size too large", {
        description: `Please upload a file smaller than ${isVideo ? "128MB" : "32MB"}`,
      });
      return;
    }

    setSelectedFile(file);

    // If video, convert to audio first
    if (isVideo) {
      setIsProcessingVideo(true);
      toast.info("Converting video to audio...");

      try {
        const audioFile = await convertVideoToAudio(file);
        setProcessedAudioFile(audioFile);

        const duration = await getAudioDuration(audioFile);

        if (duration < 15) {
          toast.error("Audio too short", {
            description: `The audio is only ${Math.floor(duration)} seconds long. Please upload audio that's at least 15 seconds.`,
          });
          setSelectedFile(null);
          setProcessedAudioFile(null);
          setIsProcessingVideo(false);
          return;
        }

        // Generate base64 for preview
        const base64 = await fileToBase64(audioFile);
        setAudioBase64(base64);

        toast.success("Video converted to audio successfully");

        // If exactly 15 seconds, upload directly
        if (duration >= 15 && duration < 16) {
          toast.info("Audio is already 15 seconds, uploading directly...");
          await uploadFile(audioFile);
        } else {
          setShowTrimmer(true);
        }
      } catch (error) {
        console.error("Video conversion failed:", error);
        toast.error("Failed to convert video to audio");
        setSelectedFile(null);
      } finally {
        setIsProcessingVideo(false);
      }
    } else {
      // For audio files, check duration
      const duration = await getAudioDuration(file);

      if (duration < 15) {
        toast.error("Audio too short", {
          description: `The audio is only ${Math.floor(duration)} seconds long. Please upload audio that's at least 15 seconds.`,
        });
        setSelectedFile(null);
        return;
      }

      setProcessedAudioFile(file);

      // Generate base64 for preview
      const base64 = await fileToBase64(file);
      setAudioBase64(base64);

      // If exactly 15 seconds, upload directly
      if (duration >= 15 && duration < 16) {
        toast.info("Audio is already 15 seconds, uploading directly...");
        await uploadFile(file);
      } else {
        setShowTrimmer(true);
      }
    }
  };

  /**
   * Confirm trim and upload
   */
  const handleTrimConfirm = async (trimmedFile: File) => {
    setIsTrimming(true);

    try {
      // Generate base64 for the trimmed audio
      const base64 = await fileToBase64(trimmedFile);
      setAudioBase64(base64);

      // Upload the trimmed 15-second audio
      await uploadFile(trimmedFile);
    } finally {
      setIsTrimming(false);
    }
  };

  /**
   * Cancel trimming
   */
  const handleCancelTrim = () => {
    setShowTrimmer(false);
    setSelectedFile(null);
    setProcessedAudioFile(null);
    setAudioBase64(null);
  };

  /**
   * Remove audio and lyrics
   */
  const handleRemoveAudio = async () => {
    try {
      await removeMediaMutation({ campaignId });

      setSelectedFile(null);
      setProcessedAudioFile(null);
      setShowTrimmer(false);
      setAudioBase64(null);

      toast.success("Audio and lyrics removed successfully");
    } catch (error) {
      toast.error("Failed to remove audio");
      throw error;
    }
  };

  return {
    selectedFile,
    processedAudioFile,
    audioBase64,
    isProcessingVideo,
    showTrimmer,
    isTrimming,
    isUploading,
    uploadProgress,
    handleFileSelect,
    handleTrimConfirm,
    handleCancelTrim,
    handleRemoveAudio,
  };
}
