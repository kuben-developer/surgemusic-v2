"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { CalendarX, Loader2 } from "lucide-react";
import { useUnscheduleLogic } from "../hooks/useUnscheduleLogic";
import { UnscheduleVideoHeader } from "../components/UnscheduleVideoHeader";
import { UnscheduleVideoItem } from "../components/UnscheduleVideoItem";
import { UnscheduleProgress } from "../components/UnscheduleProgress";
import type { UnscheduleDialogProps } from "../types/unschedule.types";

export function UnscheduleDialog({ isOpen, onOpenChange, campaignId, onUnscheduleComplete }: UnscheduleDialogProps) {
  // Fetch scheduled videos
  const scheduledVideos = useQuery(api.app.campaigns.getScheduledVideos, isOpen ? { campaignId: campaignId as Id<"campaigns"> } : "skip");
  const isLoading = scheduledVideos === undefined;

  // Use custom hook for unschedule logic
  const {
    selectedVideos,
    unschedulingProgress,
    isUnscheduling,
    unscheduleResults,
    toggleSelectAll,
    toggleVideoSelection,
    handleBulkUnschedule,
    resetState
  } = useUnscheduleLogic();

  // Handle dialog close and reset state
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  // Handle unschedule action
  const handleUnschedule = () => {
    if (scheduledVideos) {
      handleBulkUnschedule(scheduledVideos, onUnscheduleComplete, onOpenChange);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Unschedule Posts
          </DialogTitle>
          <DialogDescription>
            Select the scheduled posts you want to unschedule. This will remove them from the posting queue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : scheduledVideos && scheduledVideos.length > 0 ? (
            <>
              {/* Video selection header */}
              <UnscheduleVideoHeader
                selectedVideos={selectedVideos}
                scheduledVideos={scheduledVideos}
                isUnscheduling={isUnscheduling}
                onToggleSelectAll={() => toggleSelectAll(scheduledVideos)}
              />

              {/* Video list */}
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-3">
                  {scheduledVideos.map((video) => {
                    const result = unscheduleResults.find(r => r.postId === video.postId);
                    
                    return (
                      <UnscheduleVideoItem
                        key={video.postId}
                        video={video}
                        isSelected={selectedVideos.includes(video.postId)}
                        isUnscheduling={isUnscheduling}
                        result={result}
                        onToggleSelection={toggleVideoSelection}
                      />
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Progress indicator */}
              <UnscheduleProgress
                progress={unschedulingProgress}
                selectedCount={selectedVideos.length}
                isUnscheduling={isUnscheduling}
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarX className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No scheduled posts found</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUnscheduling}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleUnschedule}
            disabled={selectedVideos.length === 0 || isUnscheduling}
          >
            {isUnscheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Unscheduling...
              </>
            ) : (
              <>
                <CalendarX className="h-4 w-4 mr-2" />
                Unschedule Selected
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}