"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Loader2, Upload, Trash2 } from "lucide-react";
import { useCampaignLyrics } from "../hooks/useCampaignLyrics";

interface LyricsSectionProps {
  campaignId: string;
  srtUrl?: string;
  hasSrt?: boolean;
}

export function LyricsSection({
  campaignId,
  srtUrl,
  hasSrt = false,
}: LyricsSectionProps) {
  const srtFileInputRef = useRef<HTMLInputElement>(null);

  const {
    isUploading,
    isRemoving,
    srtContent,
    isFetchingSrt,
    handleUploadSRT,
    handleRemoveSRT,
  } = useCampaignLyrics(campaignId, srtUrl);

  const handleSRTFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Lyrics</h3>
        </div>

        {!hasSrt && (
          <Button
            size="sm"
            onClick={() => srtFileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload SRT
              </>
            )}
          </Button>
        )}
      </div>

      <input
        ref={srtFileInputRef}
        type="file"
        accept=".srt"
        className="hidden"
        onChange={handleSRTFileSelect}
      />

      {hasSrt && srtContent ? (
        <Card className="p-4">
          <div className="space-y-3">
            <pre className="max-h-60 overflow-y-auto text-sm font-mono bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
              {srtContent}
            </pre>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveSRT}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : hasSrt && isFetchingSrt ? (
        <Card className="p-4 text-center">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Loading SRT content...</p>
        </Card>
      ) : (
        <Card className="p-4 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No SRT file uploaded</p>
          <p className="text-xs text-muted-foreground">
            Upload an SRT file to add lyrics to your videos
          </p>
        </Card>
      )}
    </div>
  );
}
