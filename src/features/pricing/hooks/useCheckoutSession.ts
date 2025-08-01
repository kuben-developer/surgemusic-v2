'use client';

import { useAction } from "convex/react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import type { UseCheckoutSessionReturn, CheckoutSessionParams } from '../types/pricing.types';

/**
 * Hook for managing Stripe checkout sessions
 */
export function useCheckoutSession(): UseCheckoutSessionReturn {
  const router = useRouter();
  const createCheckoutSessionAction = useAction(api.stripe.createCheckoutSession);
  
  const createCheckoutSession = async (params: CheckoutSessionParams): Promise<void> => {
    // Validate parameters
    if (!params.priceId || params.priceId.trim() === '') {
      toast.error("Invalid plan selected", {
        description: "Please select a valid pricing plan"
      });
      return;
    }

    try {
      const url = await createCheckoutSessionAction(params);
      
      if (!url) {
        throw new Error("No checkout URL received from server");
      }
      
      // Navigate to Stripe checkout
      router.push(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error("Failed to create checkout session", {
        description: errorMessage
      });
      
      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Checkout session error:', error);
      }
    }
  };

  return { createCheckoutSession };
}