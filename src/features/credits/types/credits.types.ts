import type { LucideIcon } from "lucide-react";

export interface CreditPackage {
  credits: number;
  price: number;
  priceId: string;
}

export interface CreditOption {
  credits: number;
  price: number;
  priceId: string;
  icon: LucideIcon;
  iconColor: string;
}

export interface User {
  videoGenerationCredit: number;
  videoGenerationAdditionalCredit: number;
  subscriptionPriceId?: string;
  isTrial: boolean;
  firstTimeUser: boolean;
}

export interface UseCreditsReturn {
  loadingPriceId: string | null;
  setLoadingPriceId: (priceId: string | null) => void;
  handleSelectCredits: (priceId: string, onSelectCredits: (priceId: string) => Promise<void>) => Promise<void>;
  isLoading: boolean;
  resetLoading: () => void;
}

export interface CreditsDisplayProps {
  className?: string;
}

export interface CreditsDialogProps {
  onSelectCredits: (priceId: string) => void;
  hasSubscription: boolean;
  disabled?: boolean;
}

export interface CreditOptionCardProps {
  option: CreditOption;
  onSelect: (priceId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  hasSubscription: boolean;
}

export interface SubscriptionRequiredNoticeProps {
  onNavigateToPricing: () => void;
}