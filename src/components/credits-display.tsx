"use client"
import { api } from "@/trpc/react";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreditsDialog } from "./credits-dialog";

export function CreditsDisplay() {
  const router = useRouter();
  const { data: user } = api.user.getCurrentUser.useQuery();

  const { mutate: createCheckoutSession } = api.stripe.createCheckoutSession.useMutation({
    onSuccess: (url) => {
      if (url) {
        router.push(url);
      }
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center text-center gap-4">
      <div className="flex items-center text-center gap-1">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="font-semibold">{user.videoGenerationCredit + user.videoGenerationAdditionalCredit}</span>
      </div>
      <CreditsDialog onSelectCredits={(priceId) => createCheckoutSession({
        priceId,
        mode: "payment",
      })} hasSubscription={!!user?.subscriptionPriceId && !user?.isTrial} />
    </div>
  );
} 