"use client"

import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import type { ScheduleData, SchedulingProgress } from "../types/schedule.types";

interface UseScheduleSubmissionProps {
  schedules: ScheduleData[];
  setIsScheduling: (value: boolean) => void;
  setSchedulingProgress: (value: SchedulingProgress | ((prev: SchedulingProgress) => SchedulingProgress)) => void;
  setShowProgressModal: (value: boolean) => void;
  onScheduleComplete: () => void;
}

export function useScheduleSubmission({
  schedules,
  setIsScheduling,
  setSchedulingProgress,
  setShowProgressModal,
  onScheduleComplete,
}: UseScheduleSubmissionProps) {
  const schedulePost = useAction(api.ayrshare.schedulePost);

  const batchSchedule = async () => {
    if (schedules.length === 0) {
      toast.error("No schedules to process");
      return;
    }

    setIsScheduling(true);
    setSchedulingProgress({
      total: schedules.length,
      completed: 0,
      inProgress: true
    });

    setShowProgressModal(true);

    const BATCH_SIZE = 5; // Process 5 schedules per batch
    let currentBatch = 0;

    const processBatch = async (): Promise<void> => {
      const startIdx = currentBatch * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, schedules.length);

      if (startIdx >= schedules.length) {
        // All batches processed
        return;
      }

      const batchSchedules = schedules.slice(startIdx, endIdx);

      try {
        await schedulePost({ schedules: batchSchedules });

        // Update progress
        currentBatch++;
        setSchedulingProgress(prev => ({
          ...prev,
          completed: Math.min(endIdx, schedules.length)
        }));

        // Process next batch if there are more schedules
        if (endIdx < schedules.length) {
          await processBatch();
        } else {
          // All done
          handleSchedulingComplete();
        }
      } catch (error) {
        handleSchedulingError(error);
      }
    };

    // Start processing batches
    await processBatch();
  };

  const handleSchedulingComplete = () => {
    setSchedulingProgress(prev => ({
      ...prev,
      inProgress: false
    }));
    toast.success("All posts have been scheduled successfully");
    
    // Wait a moment before closing the progress modal
    setTimeout(() => {
      setShowProgressModal(false);
      onScheduleComplete();
    }, 2000);
  };

  const handleSchedulingError = (error: unknown) => {
    setIsScheduling(false);
    setShowProgressModal(false);
    toast.error(error instanceof Error ? error.message : "Failed to schedule posts");
    setSchedulingProgress(prev => ({
      ...prev,
      inProgress: false
    }));
  };

  return {
    batchSchedule,
  };
}