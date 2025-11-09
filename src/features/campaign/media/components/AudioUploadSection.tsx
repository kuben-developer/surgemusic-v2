"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Music, Upload, Trash2, Loader2 } from "lucide-react";
import { AudioTrimmer } from "@/features/campaign-old/create/components/AudioTrimmer";
import { useCampaignAudio } from "../hooks/useCampaignAudio";

interface AudioUploadSectionProps {
  campaignId: string;
  currentAudioUrl?: string;
  onAudioUploaded?: () => void;
}

export function AudioUploadSection({
  campaignId,
  currentAudioUrl,
  onAudioUploaded,
}: AudioUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
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
  } = useCampaignAudio(campaignId);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveClick = async () => {
    if (confirm("Are you sure you want to remove the audio and lyrics?")) {
      await handleRemoveAudio();
      onAudioUploaded?.();
    }
  };

  // Show trimmer if needed
  if (showTrimmer && processedAudioFile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Trim Audio to 15 Seconds</h3>
        </div>

        <AudioTrimmer
          audioFile={processedAudioFile}
          onConfirm={async (trimmedFile) => {
            await handleTrimConfirm(trimmedFile);
            onAudioUploaded?.();
          }}
          onCancel={handleCancelTrim}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Audio</h3>
        </div>

        {currentAudioUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveClick}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Audio
          </Button>
        )}
      </div>

      {currentAudioUrl ? (
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">15-second audio clip uploaded</p>
              <audio src={currentAudioUrl} controls className="w-full mt-1.5" />
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card
            className={`p-6 border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              {isProcessingVideo ? (
                <>
                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  <div>
                    <p className="text-sm font-medium">Converting video to audio...</p>
                    <p className="text-xs text-muted-foreground">Please wait</p>
                  </div>
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  <div className="w-full max-w-xs">
                    <p className="text-sm font-medium mb-2">Uploading audio...</p>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {uploadProgress}%
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Drag and drop audio or video file here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, or video files (max 32MB audio, 128MB video)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Audio will be trimmed to exactly 15 seconds
                    </p>
                  </div>
                  <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                    Select File
                  </Button>
                </>
              )}
            </div>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </>
      )}
    </div>
  );
}
