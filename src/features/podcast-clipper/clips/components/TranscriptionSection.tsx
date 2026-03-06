"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, Save, Users } from "lucide-react";

interface TranscriptionSectionProps {
  transcriptionStatus: string;
  hasVideo: boolean;
  speakers: string[];
  speakerSamples: Record<string, string>;
  currentSpeakerNames: Record<string, string>;
  onStartTranscription: () => void;
  onUpdateSpeakerNames: (names: Record<string, string>) => void;
}

export function TranscriptionSection({
  transcriptionStatus,
  hasVideo,
  speakers,
  speakerSamples,
  currentSpeakerNames,
  onStartTranscription,
  onUpdateSpeakerNames,
}: TranscriptionSectionProps) {
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>(currentSpeakerNames);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSpeakers = async () => {
    setIsSaving(true);
    try {
      await onUpdateSpeakerNames(speakerNames);
    } finally {
      setIsSaving(false);
    }
  };

  if (transcriptionStatus === "none") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Transcription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Transcribe the podcast audio to detect speakers and generate word-level timestamps.
          </p>
          <Button onClick={onStartTranscription} disabled={!hasVideo}>
            <Mic className="h-4 w-4 mr-2" />
            Start Transcription
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (transcriptionStatus === "pending") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Transcription
            <Badge variant="secondary">In Progress</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Transcribing audio... This may take a few minutes.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transcriptionStatus === "failed") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Transcription
            <Badge variant="destructive">Failed</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Transcription failed. Please try again.
          </p>
          <Button onClick={onStartTranscription} disabled={!hasVideo}>
            Retry Transcription
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Completed — show speaker naming
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Name Speakers
          <Badge variant="secondary">{speakers.length} detected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Name each detected speaker. This helps the AI generate better hook text.
        </p>
        {speakers.map((speakerId) => (
          <div key={speakerId} className="space-y-1.5">
            <Label htmlFor={`speaker-${speakerId}`} className="text-xs font-medium">
              {speakerId}
            </Label>
            <Input
              id={`speaker-${speakerId}`}
              placeholder="e.g. Joe Rogan"
              value={speakerNames[speakerId] ?? ""}
              onChange={(e) =>
                setSpeakerNames((prev) => ({ ...prev, [speakerId]: e.target.value }))
              }
            />
            {speakerSamples[speakerId] && (
              <p className="text-xs text-muted-foreground italic truncate">
                &ldquo;{speakerSamples[speakerId]}&rdquo;
              </p>
            )}
          </div>
        ))}
        <Button onClick={handleSaveSpeakers} disabled={isSaving} size="sm">
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Names
        </Button>
      </CardContent>
    </Card>
  );
}
