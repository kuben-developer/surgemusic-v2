'use client';

import { useAction } from "convex/react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import type { UsePortalSessionReturn } from '../types/pricing.types';

/**
 * Hook for managing Stripe customer portal sessions
 */
export function usePortalSession(): UsePortalSessionReturn {
  const router = useRouter();
  const createPortalSessionAction = useAction(api.app.stripe.createCustomerPortalSession);
  
  const createPortalSession = async (): Promise<void> => {
    try {
      const url = await createPortalSessionAction();
      
      if (!url) {
        throw new Error("No portal URL received from server");
      }
      
      // Navigate to Stripe customer portal
      router.push(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error("Failed to create portal session", {
        description: errorMessage
      });
      
      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Portal session error:', error);
      }
    }
  };

  return { createPortalSession };
}