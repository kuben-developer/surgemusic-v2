"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music2, User } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "../constants/metrics";

interface CampaignInfoSectionProps {
  campaignMetadata: {
    campaignId: string;
    name: string;
    artist: string;
    song: string;
  };
  totals: {
    posts: number;
    views: number;
  };
}

export function CampaignInfoSection({ campaignMetadata }: CampaignInfoSectionProps) {
  // Only show artist/song if they have valid data
  const hasArtist = campaignMetadata.artist && campaignMetadata.artist !== 'Unknown Artist';
  const hasSong = campaignMetadata.song && campaignMetadata.song !== 'Unknown Song';
  const showArtistSong = hasArtist || hasSong;

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-6 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{campaignMetadata.name}</h2>
            <Badge variant="secondary">TikTok</Badge>
          </div>
          {showArtistSong && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
              {hasArtist && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{campaignMetadata.artist}</span>
                </div>
              )}
              {hasSong && (
                <div className="flex items-center gap-1.5">
                  <Music2 className="h-4 w-4" />
                  <span>{campaignMetadata.song}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
