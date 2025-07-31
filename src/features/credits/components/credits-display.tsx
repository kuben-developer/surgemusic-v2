"use client"
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreditsDialog } from "./credits-dialog";

export function CreditsDisplay() {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);

  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);

  const handleCreateCheckoutSession = async (priceId: string, mode: "subscription" | "payment") => {
    const url = await createCheckoutSession({ priceId, mode });
    if (url) {
      router.push(url);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center text-center gap-4">
      <div className="flex items-center text-center gap-1">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="font-semibold">{user.videoGenerationCredit + user.videoGenerationAdditionalCredit}</span>
      </div>
      <CreditsDialog onSelectCredits={(priceId) => handleCreateCheckoutSession(priceId, "payment")} 
        hasSubscription={!!user?.subscriptionPriceId && !user?.isTrial} />
    </div>
  );
} 