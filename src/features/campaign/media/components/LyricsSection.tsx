"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Loader2, Edit, AlertCircle } from "lucide-react";
import { LyricsEditor } from "@/features/campaign-old/create/components/LyricsEditor";
import { useCampaignLyrics } from "../hooks/useCampaignLyrics";

interface LyricsSectionProps {
  campaignId: string;
  audioUrl?: string;
  audioBase64?: string;
  hasLyrics?: boolean;
}

export function LyricsSection({
  campaignId,
  audioUrl,
  audioBase64,
  hasLyrics = false,
}: LyricsSectionProps) {
  const {
    lyrics,
    wordsData,
    isTranscribing,
    transcriptionFailed,
    transcriptionError,
    showLyricsEditor,
    handleTranscribe,
    handleSaveLyrics,
    openLyricsEditor,
    closeLyricsEditor,
  } = useCampaignLyrics(campaignId, audioUrl);

  // Show message if no audio uploaded yet
  if (!audioUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Lyrics</h3>
        </div>

        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Please upload audio first to transcribe lyrics
          </p>
        </Card>
      </div>
    );
  }

  // Show lyrics editor if open
  if (showLyricsEditor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Edit Lyrics</h3>
        </div>

        <LyricsEditor
          initialLyrics={lyrics}
          onSave={handleSaveLyrics}
          onCancel={closeLyricsEditor}
          audioBase64={audioBase64}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Lyrics</h3>
        </div>

        <div className="flex gap-2">
          {hasLyrics && (
            <Button variant="outline" size="sm" onClick={openLyricsEditor}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lyrics
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleTranscribe}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Transcribing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {hasLyrics ? "Re-transcribe" : "Transcribe Audio"}
              </>
            )}
          </Button>
        </div>
      </div>

      {hasLyrics ? (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Lyrics transcribed</p>
              <p className="text-sm text-muted-foreground">
                15 seconds of synchronized lyrics
              </p>
            </div>
          </div>
        </Card>
      ) : transcriptionFailed ? (
        <Card className="p-6 border-destructive">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-destructive mb-2">
                Transcription Failed
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {transcriptionError ||
                  "We tried three times but couldn't transcribe the audio. You can retry or edit manually."}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    "Retry"
                  )}
                </Button>
                <Button size="sm" onClick={openLyricsEditor}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Manually
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No lyrics yet</p>
          <p className="text-sm text-muted-foreground">
            Click "Transcribe Audio" to automatically detect lyrics using
            ElevenLabs
          </p>
        </Card>
      )}
    </div>
  );
}
