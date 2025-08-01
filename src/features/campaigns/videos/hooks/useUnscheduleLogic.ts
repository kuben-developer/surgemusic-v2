"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";

interface UnscheduleResult {
  postId: string;
  success: boolean;
  error?: string;
}

export function useUnscheduleLogic() {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [unschedulingProgress, setUnschedulingProgress] = useState(0);
  const [isUnscheduling, setIsUnscheduling] = useState(false);
  const [unscheduleResults, setUnscheduleResults] = useState<UnscheduleResult[]>([]);

  const unschedulePost = useMutation(api.ayrshare.unschedulePost);

  const toggleSelectAll = (scheduledVideos?: any[]) => {
    if (!scheduledVideos) return;
    
    if (selectedVideos.length === scheduledVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(scheduledVideos.map(v => v.postId));
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
      const result = await unschedulePost({ postIds: selectedVideos });
      
      setUnschedulingProgress(100);
      
      if ('results' in result && Array.isArray((result as any).results)) {
        setUnscheduleResults((result as any).results);
      }

      toast.success(result.message || "Unscheduling complete");
      
      if (onComplete) {
        onComplete();
      }

      const failureCount = 'results' in result && Array.isArray((result as any).results) 
        ? (result as any).results.filter((r: any) => !r.success).length 
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