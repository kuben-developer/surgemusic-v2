"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAdvancedAnalytics } from "./hooks/useAdvancedAnalytics";
import { TopPerformingVideosTable } from "./components/TopPerformingVideosTable";
import { VideoMetricsChart } from "./components/VideoMetricsChart";

interface AdvancedAnalyticsViewProps {
  selectedCampaigns: string[];
}

export function AdvancedAnalyticsView({ selectedCampaigns }: AdvancedAnalyticsViewProps) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdvancedAnalytics({
    selectedCampaigns,
  });

  // Find the selected video
  const selectedVideo = data?.videos.find((v) => v.id === selectedVideoId);

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[400px] flex items-center justify-center"
      >
        <div className="text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading advanced analytics...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[400px] flex items-center justify-center"
      >
        <div className="text-center text-destructive">
          <p className="text-lg font-semibold">Error Loading Data</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </motion.div>
    );
  }

  // No data state
  if (!data || data.videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg"
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No Advanced Analytics Data</p>
          <p className="text-sm mt-2">
            No videos found with advanced analytics for the selected campaigns.
          </p>
          <p className="text-xs mt-1 text-muted-foreground/70">
            Videos must be posted via Ayrshare API to have advanced analytics.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Table (takes 5 columns on large screens) */}
        <div className="lg:col-span-8">
          <TopPerformingVideosTable
            videos={data.videos}
            selectedVideoId={selectedVideoId}
            onVideoSelect={setSelectedVideoId}
          />
        </div>

        {/* Right column - Chart (takes 1 column on large screens) */}
        <div className="lg:col-span-4">
          {selectedVideo ? (
            <VideoMetricsChart video={selectedVideo} />
          ) : (
            <div className="border border-dashed border-border/40 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <p className="text-xs font-medium">Select Video</p>
                <p className="text-[10px] mt-1 leading-tight">
                  Click a video to view analytics
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
