"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AudioUploadSection } from "./AudioUploadSection";
import { LyricsSection } from "./LyricsSection";
import { CaptionsSection } from "./CaptionsSection";

interface CampaignMediaSectionProps {
  campaignId: string;
}

export function CampaignMediaSection({ campaignId }: CampaignMediaSectionProps) {
  const [audioBase64, setAudioBase64] = useState<string | undefined>(undefined);

  // Fetch media data for this campaign
  const mediaData = useQuery(api.app.airtableCampaignsMedia.getMediaData, {
    campaignId,
  });

  const handleAudioUploaded = () => {
    // Force re-fetch of media data
    // The Convex query will automatically update
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Audio Upload Section */}
      <AudioUploadSection
        campaignId={campaignId}
        currentAudioUrl={mediaData?.audioUrl}
        onAudioUploaded={handleAudioUploaded}
      />

      <Separator />

      {/* Lyrics Section */}
      <LyricsSection
        campaignId={campaignId}
        audioUrl={mediaData?.audioUrl}
        audioBase64={audioBase64}
        hasLyrics={mediaData?.hasLyrics}
        savedLyrics={mediaData?.lyrics}
      />

      <Separator />

      {/* Captions Section */}
      <CaptionsSection campaignId={campaignId} />
    </Card>
  );
}
