"use client";

import { Card } from "@/components/ui/card";
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
    manualPosts: number;
    apiPosts: number;
    views: number;
  };
  currencySymbol?: CurrencySymbol;
  manualCpmMultiplier?: number;
  apiCpmMultiplier?: number;
}

export function CampaignInfoSection({
  campaignMetadata,
  totals,
  currencySymbol = "USD",
  manualCpmMultiplier = 0.5,
  apiCpmMultiplier = 0.5,
}: CampaignInfoSectionProps) {
  // Only show artist/song if they have valid data
  const hasArtist = campaignMetadata.artist && campaignMetadata.artist !== 'Unknown Artist';
  const hasSong = campaignMetadata.song && campaignMetadata.song !== 'Unknown Song';
  const showArtistSong = hasArtist || hasSong;

  // Calculate CPM with separate multipliers for manual and API videos
  const cpm = calculateCPM({
    totalViews: totals.views,
    manualVideoCount: totals.manualPosts,
    apiVideoCount: totals.apiPosts,
    manualCpmMultiplier,
    apiCpmMultiplier,
  });
  const formattedCPM = formatCPM(cpm, currencySymbol);

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Campaign name */}
          <h2 className="text-base sm:text-xl font-semibold truncate">{campaignMetadata.name}</h2>

          {/* Artist/Song + CPM row */}
          <div className="flex items-center justify-between gap-3">
            {/* Artist & Song stacked */}
            {showArtistSong && (
              <div className="flex flex-col gap-0.5 text-xs sm:text-sm text-muted-foreground min-w-0">
                {hasArtist && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{campaignMetadata.artist}</span>
                  </div>
                )}
                {hasSong && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Music2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{campaignMetadata.song}</span>
                  </div>
                )}
              </div>
            )}

            {/* CPM */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 sm:gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-help flex-shrink-0">
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">CPM</span>
                    <span className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formattedCPM}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cost Per 1K Views</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
