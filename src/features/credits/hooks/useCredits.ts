import { useState } from "react";

interface UseCreditsReturn {
  loadingPriceId: string | null;
  setLoadingPriceId: (priceId: string | null) => void;
  handleSelectCredits: (priceId: string, onSelectCredits: (priceId: string) => void) => void;
}

export function useCredits(): UseCreditsReturn {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleSelectCredits = (priceId: string, onSelectCredits: (priceId: string) => void) => {
    setLoadingPriceId(priceId);
    onSelectCredits(priceId);
  };

  return {
    loadingPriceId,
    setLoadingPriceId,
    handleSelectCredits,
  };
}