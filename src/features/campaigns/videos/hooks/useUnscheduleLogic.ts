"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { ScheduledVideo, UnscheduleResult } from "../types/unschedule.types";

interface UnscheduleResponse {
  message: string;
  results: UnscheduleResult[];
}

export function useUnscheduleLogic() {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [unschedulingProgress, setUnschedulingProgress] = useState(0);
  const [isUnscheduling, setIsUnscheduling] = useState(false);
  const [unscheduleResults, setUnscheduleResults] = useState<UnscheduleResult[]>([]);

  const unschedulePostAyrshare = useAction(api.app.ayrshare.unschedulePost);
  const unschedulePostLate = useAction(api.app.late.unschedulePost);

  const toggleSelectAll = (scheduledVideos?: ScheduledVideo[]) => {
    if (!scheduledVideos) return;
    
    if (selectedVideos.length === scheduledVideos.length) {
      setSelectedVideos([]);
    } else {
      // Extract post IDs from the scheduled videos
      const postIds = scheduledVideos.map(video => video.postId);
      setSelectedVideos(postIds);
    }
  };

  const toggleVideoSelection = (postId: string) => {
    setSelectedVideos(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBulkUnschedule = async (
    scheduledVideos: ScheduledVideo[],
    onComplete?: () => void,
    onClose?: (open: boolean) => void
  ) => {
    if (selectedVideos.length === 0) {
      toast.error("Please select at least one video to unschedule");
      return;
    }

    setIsUnscheduling(true);
    setUnschedulingProgress(50);
    setUnscheduleResults([]);

    try {
      // Group selected videos by provider
      const ayrsharePostIds: string[] = [];
      const latePostIds: string[] = [];

      selectedVideos.forEach(postId => {
        const video = scheduledVideos.find(v => v.postId === postId);
        if (video) {
          if (video.provider === "late") {
            latePostIds.push(postId);
          } else {
            ayrsharePostIds.push(postId);
          }
        }
      });

      // Call unschedule APIs based on provider
      const results: UnscheduleResult[] = [];

      if (ayrsharePostIds.length > 0) {
        const ayrshareResult = await unschedulePostAyrshare({ postIds: ayrsharePostIds }) as UnscheduleResponse;
        if (ayrshareResult.results) {
          results.push(...ayrshareResult.results);
        }
      }

      if (latePostIds.length > 0) {
        const lateResult = await unschedulePostLate({ postIds: latePostIds }) as UnscheduleResponse;
        if (lateResult.results) {
          results.push(...lateResult.results);
        }
      }

      setUnschedulingProgress(100);
      setUnscheduleResults(results);

      const failureCount = results.filter(r => !r.success).length;

      if (failureCount > 0) {
        toast.warning(`Unscheduling completed with ${failureCount} failure(s)`);
      } else {
        toast.success("All posts unscheduled successfully");
      }

      if (onComplete) {
        onComplete();
      }

      if (failureCount === 0 && onClose) {
        setTimeout(() => {
          onClose(false);
        }, 1000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unschedule selected posts");
    } finally {
      setIsUnscheduling(false);
      setSelectedVideos([]);
    }
  };

  const resetState = () => {
    setSelectedVideos([]);
    setUnschedulingProgress(0);
    setIsUnscheduling(false);
    setUnscheduleResults([]);
  };

  return {
    selectedVideos,
    unschedulingProgress,
    isUnscheduling,
    unscheduleResults,
    toggleSelectAll,
    toggleVideoSelection,
    handleBulkUnschedule,
    resetState
  };
}
