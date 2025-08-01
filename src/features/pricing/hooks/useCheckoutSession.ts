import { useAction } from "convex/react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";

export function useCheckoutSession() {
  const router = useRouter();
  const createCheckoutSessionAction = useAction(api.stripe.createCheckoutSession);
  
  const createCheckoutSession = async (params: { priceId: string; trial?: boolean }) => {
    try {
      const url = await createCheckoutSessionAction(params);
      if (url) {
        router.push(url);
      }
    } catch (error) {
      toast.error("Failed to create checkout session", {
        description: (error as Error).message
      });
    }
  };

  return { createCheckoutSession };
}