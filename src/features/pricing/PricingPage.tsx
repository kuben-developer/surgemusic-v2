'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePricingPlans } from './hooks/usePricingPlans';
import { useCheckoutSession } from './hooks/useCheckoutSession';
import { useTrialManagement } from './hooks/useTrialManagement';
import { usePortalSession } from './hooks/usePortalSession';
import { PricingToggle } from './components/PricingToggle';
import { TrialBanner } from './components/TrialBanner';
import { BillingManagementButton } from './components/BillingManagementButton';
import { PricingGrid } from './components/PricingGrid';
import { PricingCardSkeleton } from './components/PricingCardSkeleton';
import { TrialDialog } from './dialogs/TrialDialog';
import type { PricingPlan } from './types/pricing.types';

export function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [trialDialogOpen, setTrialDialogOpen] = useState(false);

  const {
    user,
    isLoading,
    interval,
    setInterval,
    plans,
    currentPlan,
    hasActivePlan,
    isUserOnTrial,
    isFirstTimeUser,
  } = usePricingPlans();

  const { createCheckoutSession } = useCheckoutSession();
  const { convertedToPaidPlanLoading, endTrialImmediately } = useTrialManagement();
  const { createPortalSession } = usePortalSession();

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setTrialDialogOpen(true);
  };

  const handleBuyNow = (plan: PricingPlan) => {
    if (plan.priceId) {
      void createCheckoutSession({
        priceId: plan.priceId,
      });
    }
  };

  const handleStartTrial = (plan: PricingPlan) => {
    if (plan.priceId) {
      void createCheckoutSession({
        priceId: plan.priceId,
        trial: true
      });
    }
  };

  const handleConvertToPaid = async () => {
    if (currentPlan?.priceId) {
      await endTrialImmediately();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <PricingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 ${isUserOnTrial ? 'pb-16 pt-6' : 'py-16'}`}>
      {isUserOnTrial && (
        <TrialBanner
          currentPlan={currentPlan}
          onConvertToPaid={handleConvertToPaid}
          isLoading={convertedToPaidPlanLoading}
        />
      )}

      <PricingToggle interval={interval} onIntervalChange={setInterval} />

      {user?.subscriptionPriceId && (
        <BillingManagementButton onManageBilling={() => void createPortalSession()} />
      )}

      <PricingGrid
        plans={plans}
        currentPlan={currentPlan}
        hasActivePlan={hasActivePlan}
        isUserOnTrial={isUserOnTrial}
        isFirstTimeUser={isFirstTimeUser}
        onSelectPlan={handleSelectPlan}
        onBuyNow={handleBuyNow}
        onManageBilling={() => void createPortalSession()}
      />

      <TrialDialog
        isOpen={trialDialogOpen}
        onOpenChange={setTrialDialogOpen}
        selectedPlan={selectedPlan}
        interval={interval}
        onStartTrial={handleStartTrial}
      />
    </div>
  );
}