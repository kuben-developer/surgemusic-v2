'use client';

import { useState } from 'react';
import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import type { UseTrialManagementReturn } from '../types/pricing.types';

/**
 * Hook for managing trial subscriptions
 */
export function useTrialManagement(): UseTrialManagementReturn {
  const [convertedToPaidPlanLoading, setConvertedToPaidPlanLoading] = useState(false);
  const endTrialImmediatelyAction = useAction(api.stripe.endTrialImmediately);
  
  const endTrialImmediately = async (): Promise<boolean> => {
    // Prevent multiple simultaneous requests
    if (convertedToPaidPlanLoading) {
      return false;
    }

    try {
      setConvertedToPaidPlanLoading(true);
      const response = await endTrialImmediatelyAction();
      
      if (!response) {
        throw new Error("No response received from server");
      }
      
      if (response.status === 'active') {
        toast.success("Trial Ended Successfully", {
          description: "Your paid plan is now active!",
        });
        return true;
      } else {
        toast.error('Payment Failed', {
          description: 'Please contact support if this persists.',
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error('Error ending trial', {
        description: errorMessage,
      });
      
      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Trial management error:', error);
      }
      
      return false;
    } finally {
      setConvertedToPaidPlanLoading(false);
    }
  };

  return {
    convertedToPaidPlanLoading,
    endTrialImmediately,
  };
}