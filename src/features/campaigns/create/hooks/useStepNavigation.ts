"use client";

import { useMemo } from "react";
import { STEP_CONFIGS, type StepConfig } from "../components/step-config";

interface UseStepNavigationProps {
  campaignType: "custom" | "express";
}

export function useStepNavigation({ campaignType }: UseStepNavigationProps) {
  const availableSteps = useMemo(() => {
    return STEP_CONFIGS.filter(step => 
      step.availableFor.includes(campaignType)
    );
  }, [campaignType]);

  const getStepByIndex = (index: number): StepConfig | null => {
    return availableSteps[index] || null;
  };

  const getTotalSteps = (): number => {
    return availableSteps.length;
  };

  const getStepIndex = (stepId: string): number => {
    return availableSteps.findIndex(step => step.id === stepId);
  };

  return {
    availableSteps,
    getStepByIndex,
    getTotalSteps,
    getStepIndex,
  };
}