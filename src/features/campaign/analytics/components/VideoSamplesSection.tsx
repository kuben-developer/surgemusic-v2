"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Video, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fadeInUp } from "../constants/metrics";
import { cn } from "@/lib/utils";

interface VideoSamplesSectionProps {
  campaignId: string;
  isPublic?: boolean;
}

export function VideoSamplesSection({ campaignId, isPublic = false }: VideoSamplesSectionProps) {
  const contentSamples = useQuery(api.app.analytics.getContentSamples, { campaignId });
  const removeContentSamples = useMutation(api.app.analytics.removeContentSamples);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const handleRemoveClick = (index: number) => {
    setConfirmDeleteIndex(index);
  };

  const handleConfirmRemove = async () => {
    if (confirmDeleteIndex === null) return;

    const index = confirmDeleteIndex;
    setConfirmDeleteIndex(null);
    setRemovingIndex(index);

    try {
      await removeContentSamples({
        campaignId,
        indicesToRemove: [index],
      });
      toast.success("Video removed from content samples");
    } catch (error) {
      console.error("Failed to remove content sample:", error);
      toast.error("Failed to remove video");
    } finally {
      setRemovingIndex(null);
    }
  };

  const handleCancelRemove = () => {
    setConfirmDeleteIndex(null);
  };

  // Don't render if loading or no samples
  if (contentSamples === undefined) {
    return null;
  }

  if (contentSamples.length === 0) {
    return null;
  }

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Content Samples</h3>
              <p className="text-xs text-muted-foreground">
                {contentSamples.length} video{contentSamples.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="relative">
          {/* Mobile: Horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:hidden -mx-4 px-4 sm:-mx-6 sm:px-6">
            <AnimatePresence mode="popLayout">
              {contentSamples.map((sample, index) => (
                <motion.div
                  key={`mobile-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 snap-center"
                >
                  <VideoSampleCard
                    sample={sample}
                    index={index}
                    onRemoveClick={isPublic ? undefined : handleRemoveClick}
                    isRemoving={removingIndex === index}
                    isMobile
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            <AnimatePresence mode="popLayout">
              {contentSamples.map((sample, index) => (
                <motion.div
                  key={`desktop-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <VideoSampleCard
                    sample={sample}
                    index={index}
                    onRemoveClick={isPublic ? undefined : handleRemoveClick}
                    isRemoving={removingIndex === index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDeleteIndex !== null} onOpenChange={(open) => !open && handleCancelRemove()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove video from samples?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the video from the content samples displayed on the analytics page. You can add it back later from the campaign content page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

interface VideoSampleCardProps {
  sample: {
    videoUrl: string;
    thumbnailUrl: string;
    addedAt: number;
  };
  index: number;
  onRemoveClick?: (index: number) => void;
  isRemoving?: boolean;
  isMobile?: boolean;
}

function VideoSampleCard({ sample, index, onRemoveClick, isRemoving, isMobile }: VideoSampleCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePlayClick = () => {
    setIsPlaying(true);
    setTimeout(() => {
      void videoRef.current?.play();
    }, 0);
  };

  const handleRemoveButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveClick?.(index);
  };

  const hasThumbnail = sample.thumbnailUrl &&
    sample.thumbnailUrl !== "manual_upload" &&
    sample.thumbnailUrl !== "direct_upload" &&
    sample.thumbnailUrl !== "";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-lg overflow-hidden bg-muted border border-border",
        "hover:border-primary/20 transition-colors group",
        isMobile ? "w-[120px] aspect-[9/16]" : "aspect-[9/16]",
        isRemoving && "opacity-50 pointer-events-none"
      )}
    >
      {/* Remove button */}
      {onRemoveClick && (
        <div className={cn(
          "absolute top-1.5 right-1.5 z-20 transition-opacity",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground",
              isMobile ? "size-7" : "size-6"
            )}
            onClick={handleRemoveButtonClick}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <X className="size-3" />
            )}
          </Button>
        </div>
      )}

      {/* Video content */}
      {isInView ? (
        isPlaying ? (
          <video
            ref={videoRef}
            src={sample.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            loop
            playsInline
          />
        ) : (
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={handlePlayClick}
          >
            {hasThumbnail ? (
              <img
                src={sample.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Video className="size-8 text-muted-foreground/40" />
              </div>
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className={cn(
                "rounded-full bg-background/90 flex items-center justify-center shadow-md",
                "transition-transform group-hover:scale-105",
                isMobile ? "size-10" : "size-12"
              )}>
                <Play
                  className={cn(
                    "text-foreground ml-0.5",
                    isMobile ? "size-4" : "size-5"
                  )}
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Video className="size-6 text-muted-foreground/30 animate-pulse" />
        </div>
      )}
    </div>
  );
}
