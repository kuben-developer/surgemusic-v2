"use client";

import { motion } from "framer-motion";

interface AdvancedAnalyticsViewProps {
  selectedCampaigns: string[];
}

export function AdvancedAnalyticsView({
  selectedCampaigns,
}: AdvancedAnalyticsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg"
    >
      <div className="text-center text-muted-foreground">
        <p className="text-lg">Advanced Analytics View</p>
        <p className="text-sm mt-2">Content coming soon...</p>
        <div className="mt-4 text-xs">
          <div>
            Selected Campaigns:{" "}
            {selectedCampaigns.length === 0
              ? "All"
              : selectedCampaigns.join(", ")}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
