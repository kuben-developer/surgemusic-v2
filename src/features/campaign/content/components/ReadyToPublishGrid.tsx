"use client";

import { motion } from "framer-motion";
import { CheckCircle, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedVideoGridItem } from "./GeneratedVideoGridItem";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ReadyToPublishGridProps {
  videos: Doc<"generatedVideos">[];
  isLoading: boolean;
  error?: Error | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ReadyToPublishGrid({ videos, isLoading, error }: ReadyToPublishGridProps) {
  const handlePublishToAirtable = () => {
    // Dummy button for now
    toast.info("Publish to Airtable feature coming soon!");
  };

  if (error) {
    return (
      <div className="text-center py-16 border rounded-lg">
        <AlertCircle className="size-12 mx-auto mb-3 text-destructive" />
        <h3 className="text-base font-semibold mb-1">Error Loading Videos</h3>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <div className="size-12 mx-auto mb-3">
          <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <h3 className="text-base font-semibold mb-1">Loading Videos</h3>
        <p className="text-sm">Fetching ready-to-publish videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <CheckCircle className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Videos Ready</h3>
        <p className="text-sm">
          No generated videos are ready to publish yet.
          <br />
          Videos added from montager will appear here once processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Publish Button */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-accent/50">
        <div className="flex-1">
          <h3 className="font-medium mb-1">Ready to Publish</h3>
          <p className="text-sm text-muted-foreground">
            {videos.length} video{videos.length === 1 ? "" : "s"} ready to be published to
            Airtable
          </p>
        </div>
        <Button onClick={handlePublishToAirtable} className="shrink-0">
          <Upload className="size-4 mr-2" />
          Publish to Airtable
        </Button>
      </div>

      {/* Video Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {videos.map((video) => (
          <motion.div key={video._id} variants={item}>
            <GeneratedVideoGridItem video={video} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
