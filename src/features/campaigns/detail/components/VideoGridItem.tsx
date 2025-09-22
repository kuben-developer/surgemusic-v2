"use client"

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Film, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { themeFlags } from "../../shared/constants";
import { VideoTrialOverlay } from "./VideoTrialOverlay";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface VideoGridItemProps {
  video: Doc<"generatedVideos">;
  index: number;
  isDownloading: boolean;
  onDownload: (url: string, name: string, id: string) => void;
  /** Whether to show the trial overlay that blurs the video */
  showTrialOverlay?: boolean;
}

export function VideoGridItem({
  video,
  index,
  isDownloading,
  onDownload,
  showTrialOverlay = false,
}: VideoGridItemProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = () => {
    onDownload(video.video.url, video.video.name, String(video._id));
  };

  const handlePlayClick = async () => {
    if (!videoRef.current) return;

    try {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        await videoRef.current.play();
        setIsVideoPlaying(true);
      }
    } catch (error) {
      console.log('Video play failed:', error);
      setIsVideoPlaying(false);
    }
  };

  return (
    <motion.div
      key={index}
      variants={fadeInUp}
      className="group relative bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-primary/10 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="aspect-[9/16] bg-muted/30 relative overflow-hidden">
        <video
          ref={videoRef}
          src={video.video.url}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02] relative z-10"
          controls={!showTrialOverlay}
          loop
          style={{
            aspectRatio: "9 / 16",
            width: "100%",
            height: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 gap-2 px-3 py-1.5 bg-background/50 backdrop-blur-md border-primary/20 z-20"
        >
          <Film className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium">{themeFlags[video.video.type.toLowerCase()]}</span>
        </Badge>

        {/* Trial overlay for blurring individual videos */}
        <VideoTrialOverlay
          isVisible={showTrialOverlay}
          onPlayClick={handlePlayClick}
          isPlaying={isVideoPlaying}
        />
      </div>

      <div className="p-4 space-y-4">
        <h3 className="font-medium truncate">
          {themeFlags[video.video.type.toLowerCase()]}
        </h3>

        <Button
          variant="secondary"
          size="sm"
          className="w-full gap-2 bg-primary/5 hover:bg-primary/10 text-foreground border-primary/10 hover:border-primary/30 transition-colors"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}