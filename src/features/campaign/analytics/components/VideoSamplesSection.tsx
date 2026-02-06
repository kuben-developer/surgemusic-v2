"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Video, CheckSquare } from "lucide-react";
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
import { VideoSampleCard } from "./VideoSampleCard";
import { BulkRemoveBar } from "./BulkRemoveBar";
import { useContentSampleSelection } from "../hooks/useContentSampleSelection";

interface VideoSamplesSectionProps {
  campaignId: string;
  isPublic?: boolean;
}

export function VideoSamplesSection({ campaignId, isPublic = false }: VideoSamplesSectionProps) {
  const contentSamples = useQuery(api.app.analytics.getContentSamples, { campaignId });
  const removeContentSamples = useMutation(api.app.analytics.removeContentSamples);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [isBulkRemoving, setIsBulkRemoving] = useState(false);

  const selection = useContentSampleSelection();

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

  const handleBulkRemove = async () => {
    if (selection.selectedCount === 0) return;

    setIsBulkRemoving(true);
    try {
      await removeContentSamples({
        campaignId,
        indicesToRemove: Array.from(selection.selectedIndices),
      });
      toast.success(`${selection.selectedCount} video${selection.selectedCount > 1 ? "s" : ""} removed from content samples`);
      selection.exitSelectMode();
    } catch (error) {
      console.error("Failed to remove content samples:", error);
      toast.error("Failed to remove videos");
    } finally {
      setIsBulkRemoving(false);
    }
  };

  if (contentSamples === undefined || contentSamples.length === 0) {
    return null;
  }

  const allSelected = selection.selectedCount === contentSamples.length;

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

          {/* Select / Select All / Cancel buttons (logged-in only) */}
          {!isPublic && (
            <div className="flex items-center gap-2">
              {selection.isSelectMode ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      allSelected
                        ? selection.deselectAll()
                        : selection.selectAll(contentSamples.length)
                    }
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={selection.exitSelectMode}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selection.enterSelectMode}
                >
                  <CheckSquare className="size-4 mr-1.5" />
                  Select
                </Button>
              )}
            </div>
          )}
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
                    isSelectMode={selection.isSelectMode}
                    isSelected={selection.isSelected(index)}
                    onToggleSelect={selection.toggleSelection}
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
                    isSelectMode={selection.isSelectMode}
                    isSelected={selection.isSelected(index)}
                    onToggleSelect={selection.toggleSelection}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      {/* Bulk Remove Bar */}
      <BulkRemoveBar
        selectedCount={selection.selectedCount}
        onRemove={handleBulkRemove}
        onClear={selection.exitSelectMode}
        isLoading={isBulkRemoving}
      />

      {/* Single-item Confirmation Dialog */}
      <AlertDialog open={confirmDeleteIndex !== null} onOpenChange={(open) => !open && setConfirmDeleteIndex(null)}>
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
