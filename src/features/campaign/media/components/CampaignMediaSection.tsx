"use client";

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
  // Fetch media data for this campaign
  const mediaData = useQuery(api.app.campaignAssets.getMediaData, {
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
        srtUrl={mediaData?.srtUrl}
        hasSrt={mediaData?.hasLyrics}
      />

      <Separator />

      {/* Captions Section */}
      <CaptionsSection campaignId={campaignId} />
    </Card>
  );
}
