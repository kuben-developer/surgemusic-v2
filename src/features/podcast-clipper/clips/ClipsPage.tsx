"use client";

import { useParams, useRouter } from "next/navigation";
import { useClips } from "./hooks/useClips";
import { TranscriptionSection } from "./components/TranscriptionSection";
import { ClipGenerationSection } from "./components/ClipGenerationSection";
import { ClipList } from "./components/ClipList";
import { ProcessClipsButton } from "./components/ProcessClipsButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Scissors } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

export function ClipsPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as Id<"podcastClipperFolders">;

  const {
    folder,
    mainVideo,
    transcript,
    clips,
    transcriptionStatus,
    speakers,
    speakerSamples,
    approvedClipCount,
    isLoading,
    startTranscription,
    updateSpeakerNames,
    generateClips,
    processApprovedClips,
  } = useClips(folderId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Folder not found</h3>
        <Button onClick={() => router.push("/podcast-clipper")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Folders
        </Button>
      </div>
    );
  }

  const hasCompletedTranscription = transcriptionStatus === "completed";
  const hasSpeakerNames =
    transcript?.speakerNames &&
    Object.values(transcript.speakerNames).some((name) => name.trim() !== "");
  const canGenerate = hasCompletedTranscription && (speakers.length === 0 || !!hasSpeakerNames);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/podcast-clipper/${folderId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Clips</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              {folder.folderName}
              {clips.length > 0 && (
                <>
                  {" "}&middot; {clips.filter((c) => c.status === "completed").length}/
                  {clips.length} completed
                </>
              )}
            </p>
          </div>
        </div>
        <ProcessClipsButton
          approvedCount={approvedClipCount}
          onProcess={processApprovedClips}
        />
      </div>

      {/* Step 1: Transcription */}
      <TranscriptionSection
        transcriptionStatus={transcriptionStatus}
        hasVideo={!!mainVideo}
        speakers={speakers}
        speakerSamples={speakerSamples}
        currentSpeakerNames={transcript?.speakerNames ?? {}}
        onStartTranscription={startTranscription}
        onUpdateSpeakerNames={updateSpeakerNames}
      />

      {/* Step 2: Generate Clips (only visible after transcription + speaker naming) */}
      {hasCompletedTranscription && (
        <ClipGenerationSection
          canGenerate={canGenerate}
          onGenerate={generateClips}
        />
      )}

      {/* Step 3: Clip list */}
      {clips.length > 0 && <ClipList clips={clips} />}
    </div>
  );
}
