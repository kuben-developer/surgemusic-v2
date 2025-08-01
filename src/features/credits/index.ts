// Component exports used by other features
export { CreditsDisplay } from "./components/credits-display";
export { CreditsDialog } from "./components/credits-dialog";
export { CreditOptionCard } from "./components/credit-option-card";
export { SubscriptionRequiredNotice } from "./components/subscription-required-notice";
export { CreditExpirationNotice } from "./components/credit-expiration-notice";

// Hook exports
export { useCredits } from "./hooks/useCredits";

// Utility exports
export { 
  calculateTotalCredits, 
  hasSufficientCredits, 
  formatCreditsText, 
  hasActiveSubscription 
} from "./utils/credit-utils";

// Constants
export { CREDIT_OPTIONS } from "./constants/credit-options";

// Types
export type { 
  CreditOption, 
  CreditPackage, 
  User, 
  UseCreditsReturn, 
  CreditsDisplayProps, 
  CreditsDialogProps,
  CreditOptionCardProps,
  SubscriptionRequiredNoticeProps
} from "./types/credits.types";