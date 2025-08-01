"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface UnscheduleResult {
  postId: string;
  success: boolean;
  error?: string;
}

interface UnscheduleResponse {
  message: string;
  results: UnscheduleResult[];
}

export function useUnscheduleLogic() {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [unschedulingProgress, setUnschedulingProgress] = useState(0);
  const [isUnscheduling, setIsUnscheduling] = useState(false);
  const [unscheduleResults, setUnscheduleResults] = useState<UnscheduleResult[]>([]);

  const unschedulePost = useMutation(api.ayrshare.unschedulePost);

  const toggleSelectAll = (scheduledVideos?: Doc<"generatedVideos">[]) => {
    if (!scheduledVideos) return;
    
    if (selectedVideos.length === scheduledVideos.length) {
      setSelectedVideos([]);
    } else {
      // Extract post IDs from the various upload fields (tiktok, instagram, youtube)
      const postIds: string[] = [];
      scheduledVideos.forEach(video => {
        if (video.tiktokUpload?.post.id) postIds.push(video.tiktokUpload.post.id);
        if (video.instagramUpload?.post.id) postIds.push(video.instagramUpload.post.id);
        if (video.youtubeUpload?.post.id) postIds.push(video.youtubeUpload.post.id);
      });
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

  const handleBulkUnschedule = async (onComplete?: () => void, onClose?: (open: boolean) => void) => {
    if (selectedVideos.length === 0) {
      toast.error("Please select at least one video to unschedule");
      return;
    }

    setIsUnscheduling(true);
    setUnschedulingProgress(50);
    setUnscheduleResults([]);

    try {
      const result = await unschedulePost({ postIds: selectedVideos }) as UnscheduleResponse;
      
      setUnschedulingProgress(100);
      
      if (result.results && Array.isArray(result.results)) {
        setUnscheduleResults(result.results);
      }

      toast.success(result.message || "Unscheduling complete");
      
      if (onComplete) {
        onComplete();
      }

      const failureCount = result.results 
        ? result.results.filter(r => !r.success).length 
        : 0;
        
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