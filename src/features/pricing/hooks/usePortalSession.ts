import { useAction } from "convex/react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";

export function usePortalSession() {
  const router = useRouter();
  const createPortalSessionAction = useAction(api.stripe.createCustomerPortalSession);
  
  const createPortalSession = async () => {
    try {
      const url = await createPortalSessionAction();
      if (url) {
        router.push(url);
      }
    } catch (error) {
      toast.error("Failed to create portal session", {
        description: (error as Error).message
      });
    }
  };

  return { createPortalSession };
}