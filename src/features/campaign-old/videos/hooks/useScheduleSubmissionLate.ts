"use client"

import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import type { ScheduleDataLate, SchedulingProgress } from "../types/schedule.types";

interface SchedulePostResult {
  success: boolean;
  message: string;
  results: { videoId: string; success: boolean; error?: string }[];
  performanceMetrics: {
    totalTimeMs: number;
    totalVideos: number;
    successCount: number;
    failureCount: number;
    averageTimePerVideo: number;
  }
}

interface UseScheduleSubmissionLateProps {
  schedules: ScheduleDataLate[];
  setIsScheduling: (value: boolean) => void;
  setSchedulingProgress: (value: SchedulingProgress | ((prev: SchedulingProgress) => SchedulingProgress)) => void;
  setShowProgressModal: (value: boolean) => void;
  onScheduleComplete: () => void;
}

export function useScheduleSubmissionLate({
  schedules,
  setIsScheduling,
  setSchedulingProgress,
  setShowProgressModal,
  onScheduleComplete,
}: UseScheduleSubmissionLateProps) {
  const schedulePost = useAction(api.app.late.schedulePost);

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
    let totalFailureCount = 0;

    const processBatch = async (): Promise<void> => {
      const startIdx = currentBatch * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, schedules.length);

      if (startIdx >= schedules.length) {
        // All batches processed
        return;
      }

      const batchSchedules = schedules.slice(startIdx, endIdx);

      try {
        const res = await schedulePost({ schedules: batchSchedules }) as SchedulePostResult;

        // If the whole batch failed, show the backend-provided message and stop
        if (!res?.success) {
          const msg = res?.message || "Failed to schedule posts";
          setIsScheduling(false);
          setShowProgressModal(false);
          setSchedulingProgress(prev => ({ ...prev, inProgress: false }));
          toast.error(msg);
          return;
        }

        // Surface partial failures to the user if any
        if (res?.performanceMetrics?.failureCount > 0) {
          totalFailureCount += res.performanceMetrics.failureCount;
          const firstErr = res.results.find(r => !r.success)?.error;
          const extractMsg = (raw?: string) => {
            if (!raw) return undefined;
            try {
              const obj = JSON.parse(raw);
              const e = obj?.error || obj?.message;
              if (e) return e;
              return raw;
            } catch {
              return raw;
            }
          };
          const msg = extractMsg(firstErr) || `${res.performanceMetrics.failureCount} post(s) failed`;
          toast.warning(`Some posts failed: ${msg}`);
        }

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
          handleSchedulingComplete(totalFailureCount);
        }
      } catch (error) {
        handleSchedulingError(error);
      }
    };

    // Start processing batches
    await processBatch();
  };

  const handleSchedulingComplete = (failureCount = 0) => {
    setSchedulingProgress(prev => ({
      ...prev,
      inProgress: false
    }));
    if (failureCount > 0) {
      toast.warning(`Scheduling completed with ${failureCount} failure(s)`);
    } else {
      toast.success("All posts have been scheduled successfully via Late");
    }

    // Wait a moment before closing the progress modal
    setTimeout(() => {
      setShowProgressModal(false);
      onScheduleComplete();
    }, 2000);
  };

  const handleSchedulingError = (error: unknown) => {
    setIsScheduling(false);
    setShowProgressModal(false);
    const extractMsg = (err: unknown): string => {
      if (!err) return "Failed to schedule posts";
      if (err instanceof Error) return err.message || "Failed to schedule posts";
      if (typeof err === "string") return err;
      try {
        const anyErr = err as any;
        if (typeof anyErr.message === "string" && anyErr.message) return anyErr.message;
        if (anyErr.data) {
          if (typeof anyErr.data === "string") return anyErr.data;
          if (typeof anyErr.data.message === "string") return anyErr.data.message;
          if (typeof anyErr.data.error === "string") return anyErr.data.error;
        }
        const text = anyErr.toString?.();
        if (typeof text === "string" && text && text !== "[object Object]") return text;
      } catch {}
      return "Failed to schedule posts";
    };
    toast.error(extractMsg(error));
    setSchedulingProgress(prev => ({
      ...prev,
      inProgress: false
    }));
  };

  return {
    batchSchedule,
  };
}
