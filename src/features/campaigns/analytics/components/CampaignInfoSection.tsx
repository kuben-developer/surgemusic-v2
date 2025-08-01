"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { fadeInUp } from "../constants/metrics";

interface CampaignInfoSectionProps {
  campaign: {
    campaignName: string;
    _creationTime: number;
  };
  generatedVideosCount: number;
}

export function CampaignInfoSection({ campaign, generatedVideosCount }: CampaignInfoSectionProps) {
  return (
    <motion.section
      variants={fadeInUp}
      className="relative overflow-hidden rounded-2xl p-8 shadow-xl border border-primary/10"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
      <div className="relative space-y-4">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/30 px-3 py-1">
            Campaign Performance
          </Badge>
          <h2 className="text-3xl font-bold">{campaign.campaignName}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Created on {new Date(campaign._creationTime).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span>•</span>
            <span>{generatedVideosCount} videos</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}