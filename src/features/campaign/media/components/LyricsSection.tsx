"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Loader2, Edit, AlertCircle, Upload } from "lucide-react";
import { LyricsEditor } from "@/features/campaign-old/create/components/LyricsEditor";
import { useCampaignLyrics } from "../hooks/useCampaignLyrics";
import type { LyricLine } from "../types/media.types";

interface LyricsSectionProps {
  campaignId: string;
  audioUrl?: string;
  audioBase64?: string;
  hasLyrics?: boolean;
  savedLyrics?: LyricLine[];
}

export function LyricsSection({
  campaignId,
  audioUrl,
  audioBase64,
  hasLyrics = false,
  savedLyrics = [],
}: LyricsSectionProps) {
  const srtFileInputRef = useRef<HTMLInputElement>(null);

  const {
    lyrics,
    wordsData,
    isTranscribing,
    transcriptionFailed,
    transcriptionError,
    showLyricsEditor,
    handleTranscribe,
    handleSaveLyrics,
    handleUploadSRT,
    openLyricsEditor,
    closeLyricsEditor,
  } = useCampaignLyrics(campaignId, audioUrl);

  const handleSRTFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".srt")) {
      alert("Please upload a .srt file");
      return;
    }

    await handleUploadSRT(file);

    // Reset file input
    if (srtFileInputRef.current) {
      srtFileInputRef.current.value = "";
    }
  };

  // Show message if no audio uploaded yet
  if (!audioUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Lyrics</h3>
        </div>

        <Card className="p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Please upload audio first to transcribe lyrics
          </p>
        </Card>
      </div>
    );
  }

  // Show lyrics editor if open
  if (showLyricsEditor) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Edit Lyrics</h3>
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Lyrics</h3>
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => srtFileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload SRT
          </Button>
        </div>
      </div>

      <input
        ref={srtFileInputRef}
        type="file"
        accept=".srt"
        className="hidden"
        onChange={handleSRTFileSelect}
      />

      {hasLyrics && savedLyrics.length > 0 ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="max-h-60 overflow-y-auto divide-y divide-border text-sm">
              {savedLyrics.map((line, index) => (
                <div key={index} className="flex items-baseline gap-3 py-2 first:pt-0">
                  <span className="text-muted-foreground shrink-0 w-8 font-mono text-xs">
                    {index}s
                  </span>
                  <span className="text-foreground leading-relaxed">
                    {line.text || <span className="text-muted-foreground italic">(empty)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : transcriptionFailed ? (
        <Card className="p-3 border-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive mb-1">
                Transcription Failed
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {transcriptionError ||
                  "We tried three times but couldn't transcribe the audio. You can retry, upload an SRT file, or edit manually."}
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => srtFileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload SRT
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
        <Card className="p-4 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No lyrics yet</p>
          <p className="text-xs text-muted-foreground">
            Transcribe audio using ElevenLabs or upload an SRT file
          </p>
        </Card>
      )}
    </div>
  );
}
