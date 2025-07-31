export interface PricingPlan {
  name: string;
  price: number;
  description: string;
  videoGenerations: number;
  songs: number;
  features: string[];
  priceId: string;
  interval: 'month' | 'year';
}

export type PricingInterval = 'month' | 'year';

export interface TrialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: PricingPlan | null;
  interval: PricingInterval;
  onStartTrial: (plan: PricingPlan) => void;
}

export interface PricingCardProps {
  plan: PricingPlan;
  isCurrentPlan: boolean;
  hasActivePlan: boolean;
  isUserOnTrial: boolean;
  isFirstTimeUser: boolean;
  onSelectPlan: (plan: PricingPlan) => void;
  onBuyNow: (plan: PricingPlan) => void;
  onManageBilling: () => void;
}