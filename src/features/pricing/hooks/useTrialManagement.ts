import { useState } from 'react';
import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";

export function useTrialManagement() {
  const [convertedToPaidPlanLoading, setConvertedToPaidPlanLoading] = useState(false);
  const endTrialImmediatelyAction = useAction(api.stripe.endTrialImmediately);
  
  const endTrialImmediately = async () => {
    try {
      setConvertedToPaidPlanLoading(true);
      const response = await endTrialImmediatelyAction();
      if (response.status === 'active') {
        setConvertedToPaidPlanLoading(false);
        toast.success("Trial Ended Successfully.", {
          description: `Your paid plan is now active!`,
        });
        return true;
      } else {
        setConvertedToPaidPlanLoading(false);
        toast.error('Payment Failed.', {
          description: 'Please contact support if this persists.',
        });
        return false;
      }
    } catch (error) {
      setConvertedToPaidPlanLoading(false);
      toast.error('Error ending trial', {
        description: (error as Error).message,
      });
      return false;
    }
  };

  return {
    convertedToPaidPlanLoading,
    endTrialImmediately,
  };
}