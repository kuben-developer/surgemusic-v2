"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music2, User, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CampaignInfoCardProps {
  campaignName: string;
  artist: string;
  song: string;
  campaignId: string;
}

export function CampaignInfoCard({
  campaignName,
  artist,
  song,
  campaignId,
}: CampaignInfoCardProps) {
  const router = useRouter();

  // Only show artist/song if they have valid data
  const hasArtist = artist && artist !== "Unknown Artist";
  const hasSong = song && song !== "Unknown Song";
  const showArtistSong = hasArtist || hasSong;

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{campaignName}</h2>
            <Badge variant="secondary">TikTok</Badge>
          </div>
          {showArtistSong && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
              {hasArtist && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{artist}</span>
                </div>
              )}
              {hasSong && (
                <div className="flex items-center gap-1.5">
                  <Music2 className="h-4 w-4" />
                  <span>{song}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/campaign/${campaignId}/analytics`)}
        >
          <BarChart3 className="size-4 mr-2" />
          View Analytics
        </Button>
      </div>
    </Card>
  );
}
