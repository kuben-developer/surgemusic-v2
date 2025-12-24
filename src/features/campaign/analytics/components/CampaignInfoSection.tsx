"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Music2, User } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "../constants/metrics";
import { calculateCPM, formatCPM } from "../utils/cpm.utils";

type CurrencySymbol = "USD" | "GBP";

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
  currencySymbol?: CurrencySymbol;
}

export function CampaignInfoSection({ campaignMetadata, totals, currencySymbol = "USD" }: CampaignInfoSectionProps) {
  // Only show artist/song if they have valid data
  const hasArtist = campaignMetadata.artist && campaignMetadata.artist !== 'Unknown Artist';
  const hasSong = campaignMetadata.song && campaignMetadata.song !== 'Unknown Song';
  const showArtistSong = hasArtist || hasSong;

  // Calculate CPM
  const cpm = calculateCPM(totals.views, totals.posts);
  const formattedCPM = formatCPM(cpm, currencySymbol);

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-semibold">{campaignMetadata.name}</h2>
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 sm:px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-help self-start sm:self-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">CPM</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formattedCPM}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cost Per 1K Views</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </motion.div>
  );
}
