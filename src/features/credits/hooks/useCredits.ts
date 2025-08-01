import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { UseCreditsReturn } from "../types/credits.types";

export function useCredits(): UseCreditsReturn {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleSelectCredits = useCallback(
    async (priceId: string, onSelectCredits: (priceId: string) => Promise<void>) => {
      if (loadingPriceId) {
        toast.warning("Please wait for the current request to complete.");
        return;
      }

      if (!priceId) {
        toast.error("Invalid price ID. Please try again.");
        return;
      }

      setLoadingPriceId(priceId);
      
      try {
        await onSelectCredits(priceId);
      } catch (error) {
        console.error("Error in handleSelectCredits:", error);
        toast.error("An error occurred while processing your request.");
      } finally {
        setLoadingPriceId(null);
      }
    },
    [loadingPriceId]
  );

  const resetLoading = useCallback(() => {
    setLoadingPriceId(null);
  }, []);

  return {
    loadingPriceId,
    setLoadingPriceId,
    handleSelectCredits,
    isLoading: loadingPriceId !== null,
    resetLoading,
  };
}