"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { PodcastFolderId } from "../../shared/types/podcast-clipper.types";
import type { Id } from "../../../../../convex/_generated/dataModel";

export function useClips(folderId: PodcastFolderId) {
  const folder = useQuery(api.app.podcastClipperDb.getFolder, { folderId });
  const videos = useQuery(api.app.podcastClipperDb.getVideos, { folderId });
  const transcript = useQuery(api.app.podcastClipperClipsDb.getTranscript, { folderId });
  const clips = useQuery(api.app.podcastClipperClipsDb.getClips, { folderId });
  const clipJobs = useQuery(api.app.podcastClipperClipsDb.getClipJobs, { folderId });

  const startTranscriptionMutation = useMutation(api.app.podcastClipperClipsDb.startTranscription);
  const updateSpeakerNamesMutation = useMutation(api.app.podcastClipperClipsDb.updateSpeakerNames);
  const triggerGenerateClipsMutation = useMutation(api.app.podcastClipperClipsDb.triggerGenerateClips);
  const processApprovedClipsMutation = useMutation(api.app.podcastClipperClipsDb.processApprovedClips);

  // Find the first uploaded video (main video for this folder)
  const mainVideo = videos?.find((v) => v.status === "uploaded") ?? videos?.[0];

  const startTranscription = async () => {
    if (!mainVideo) return;
    try {
      await startTranscriptionMutation({ folderId, videoId: mainVideo._id });
      toast.success("Transcription started");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start transcription");
    }
  };

  const updateSpeakerNames = async (names: Record<string, string>) => {
    if (!transcript) return;
    try {
      await updateSpeakerNamesMutation({
        transcriptId: transcript._id,
        speakerNames: names,
      });
      toast.success("Speaker names saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save speaker names");
    }
  };

  const generateClips = async (params: {
    minClipDuration: number;
    maxClipDuration: number;
    minClipsPerHour: number;
    maxClipsPerHour: number;
  }) => {
    if (!mainVideo || !transcript) return;
    try {
      await triggerGenerateClipsMutation({
        folderId,
        videoId: mainVideo._id,
        transcriptId: transcript._id,
        ...params,
      });
      toast.success("Generating clips...");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate clips");
    }
  };

  const processApprovedClips = async () => {
    try {
      await processApprovedClipsMutation({ folderId });
      toast.success("Processing clips...");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process clips");
    }
  };

  // Compute transcription status from folder or jobs
  const transcriptionStatus = folder?.transcriptionStatus ?? "none";

  // Get unique speakers from transcript (uses speakerIds field, falls back to scanning words)
  const speakers = transcript?.speakerIds
    ?? (transcript?.words
      ? [...new Set(transcript.words.filter((w) => w.speakerId).map((w) => w.speakerId!))]
      : []);

  // Get sample quotes per speaker (only available if words are inline)
  const speakerSamples: Record<string, string> = {};
  if (transcript?.words) {
    for (const speakerId of speakers) {
      const words = transcript.words
        .filter((w) => w.speakerId === speakerId && w.type === "word")
        .slice(0, 15)
        .map((w) => w.text);
      speakerSamples[speakerId] = words.join(" ");
    }
  }

  const approvedClipCount = clips?.filter((c) => c.status === "approved").length ?? 0;

  return {
    folder,
    videos,
    mainVideo,
    transcript,
    clips: clips ?? [],
    clipJobs: clipJobs ?? [],
    transcriptionStatus,
    speakers,
    speakerSamples,
    approvedClipCount,
    isLoading: folder === undefined || videos === undefined,
    startTranscription,
    updateSpeakerNames,
    generateClips,
    processApprovedClips,
  };
}
