import { useState } from "react";
import type { ScheduleData, SchedulingProgress } from "../types/schedule.types";

export function useScheduleState() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedulingProgress, setSchedulingProgress] = useState<SchedulingProgress>({
    total: 0,
    completed: 0,
    inProgress: false
  });
  const [showProgressModal, setShowProgressModal] = useState(false);

  const resetSchedulingState = () => {
    setIsScheduling(false);
    setSchedulingProgress({
      total: 0,
      completed: 0,
      inProgress: false
    });
    setShowProgressModal(false);
  };

  return {
    schedules,
    setSchedules,
    endDate,
    setEndDate,
    isScheduling,
    setIsScheduling,
    schedulingProgress,
    setSchedulingProgress,
    showProgressModal,
    setShowProgressModal,
    resetSchedulingState,
  };
}