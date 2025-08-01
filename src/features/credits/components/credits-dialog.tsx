"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CREDIT_OPTIONS } from "../constants/credit-options";
import { useCredits } from "../hooks/useCredits";
import { SubscriptionRequiredNotice } from "./subscription-required-notice";
import { CreditExpirationNotice } from "./credit-expiration-notice";
import { CreditOptionCard } from "./credit-option-card";
import type { CreditsDialogProps } from "../types/credits.types";

export function CreditsDialog({ 
  onSelectCredits, 
  hasSubscription, 
  disabled = false 
}: CreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const { loadingPriceId, handleSelectCredits } = useCredits();

  const handleNavigateToPricing = () => {
    window.location.href = '/pricing';
  };

  const handleOptionSelect = async (priceId: string) => {
    const wrappedCallback = async (priceId: string) => {
      await Promise.resolve(onSelectCredits(priceId));
    };
    await handleSelectCredits(priceId, wrappedCallback);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm" 
          className="px-4"
          disabled={disabled}
          type="button"
        >
          Add credits
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Purchase Additional Credits</DialogTitle>
          <div className="space-y-4">
            {!hasSubscription ? (
              <SubscriptionRequiredNotice onNavigateToPricing={handleNavigateToPricing} />
            ) : (
              <CreditExpirationNotice />
            )}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {CREDIT_OPTIONS.map((option) => (
            <CreditOptionCard
              key={option.credits}
              option={option}
              onSelect={handleOptionSelect}
              isLoading={loadingPriceId === option.priceId}
              disabled={disabled}
              hasSubscription={hasSubscription}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 