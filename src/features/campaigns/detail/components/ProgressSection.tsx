"use client";

import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { ProgressSectionProps } from "../types/campaign-detail.types";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function ProgressSection({ campaign, progress }: ProgressSectionProps) {
  if (!campaign || (campaign.status as string) === 'completed') {
    return null;
  }

  return (
    <motion.section
      variants={fadeInUp}
      className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 rounded-xl p-8 shadow-sm"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
            <div className="relative bg-primary/10 p-3 rounded-full border border-primary/20">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Videos are being generated
            </h2>
            <p className="text-muted-foreground">This usually takes 5-10 minutes</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Generation Progress</span>
            <span className="text-sm font-medium text-primary">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-3 bg-background/50 shadow-inner"
          />
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Please keep this page open</p>
            <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
              The page will automatically refresh when generation is complete.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}