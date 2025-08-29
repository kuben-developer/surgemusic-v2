// User data structure from getCurrentUser API
export interface UserData {
  videoGenerationCredit: number;
  videoGenerationAdditionalCredit: number;
  subscriptionPriceId?: string;
  isTrial: boolean;
  firstTimeUser: boolean;
}

// Core types
export type PricingInterval = 'month' | 'year';

export type PlanName = 'Starter' | 'Growth' | 'Professional' | 'Ultimate';

export interface PricingPlan {
  readonly name: PlanName;
  readonly price: number;
  readonly description: string;
  readonly videoGenerations: number;
  readonly userProfile: number;
  readonly features: readonly string[];
  readonly priceId: string;
  readonly interval: PricingInterval;
}

// Component prop types
export interface TrialDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly selectedPlan: PricingPlan | null;
  readonly interval: PricingInterval;
  readonly onStartTrial: (plan: PricingPlan) => void;
}

export interface PricingCardProps {
  readonly plan: PricingPlan;
  readonly isCurrentPlan: boolean;
  readonly hasActivePlan: boolean;
  readonly isUserOnTrial: boolean;
  readonly isFirstTimeUser: boolean;
  readonly onSelectPlan: (plan: PricingPlan) => void;
  readonly onBuyNow: (plan: PricingPlan) => void;
  readonly onManageBilling: () => void;
}

export interface PricingGridProps {
  readonly plans: readonly PricingPlan[];
  readonly currentPlan: PricingPlan | undefined;
  readonly hasActivePlan: boolean;
  readonly isUserOnTrial: boolean;
  readonly isFirstTimeUser: boolean;
  readonly onSelectPlan: (plan: PricingPlan) => void;
  readonly onBuyNow: (plan: PricingPlan) => void;
  readonly onManageBilling: () => void;
}

export interface TrialBannerProps {
  readonly currentPlan: PricingPlan | undefined;
  readonly onConvertToPaid: () => void;
  readonly isLoading: boolean;
}

export interface BillingManagementButtonProps {
  readonly onManageBilling: () => void;
}

export interface PricingToggleProps {
  readonly interval: PricingInterval;
  readonly onIntervalChange: (interval: PricingInterval) => void;
}

// Hook return types
export interface UsePricingPlansReturn {
  readonly user: UserData | null | undefined;
  readonly isLoading: boolean;
  readonly interval: PricingInterval;
  readonly setInterval: (interval: PricingInterval) => void;
  readonly plans: readonly PricingPlan[];
  readonly currentPlan: PricingPlan | undefined;
  readonly hasActivePlan: boolean;
  readonly isUserOnTrial: boolean;
  readonly isFirstTimeUser: boolean;
}

export interface UseCheckoutSessionReturn {
  readonly createCheckoutSession: (params: CheckoutSessionParams) => Promise<void>;
}

export interface UsePortalSessionReturn {
  readonly createPortalSession: () => Promise<void>;
}

export interface UseTrialManagementReturn {
  readonly convertedToPaidPlanLoading: boolean;
  readonly endTrialImmediately: () => Promise<boolean>;
}

// Utility types
export interface CheckoutSessionParams {
  readonly priceId: string;
  readonly trial?: boolean;
}

export interface StatusBadgeProps {
  readonly type: 'popular' | 'current' | 'trial';
  readonly text: string;
}

// Button action types for better type safety
export type PricingCardAction = 
  | { type: 'select_plan'; plan: PricingPlan }
  | { type: 'buy_now'; plan: PricingPlan }
  | { type: 'manage_billing' };