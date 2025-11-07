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
}

export function CampaignInfoSection({ campaignMetadata }: CampaignInfoSectionProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{campaignMetadata.name}</h2>
              <Badge variant="secondary">TikTok</Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{campaignMetadata.artist}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Music2 className="h-4 w-4" />
                <span>{campaignMetadata.song}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Campaign ID: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{campaignMetadata.campaignId}</code>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
