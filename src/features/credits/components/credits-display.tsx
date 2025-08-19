"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Zap, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { CreditsDialog } from "./credits-dialog";
import { calculateTotalCredits, hasActiveSubscription } from "../utils/credit-utils";
import type { CreditsDisplayProps } from "../types/credits.types";

export function CreditsDisplay({ className }: CreditsDisplayProps = {}) {
  const router = useRouter();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  const user = useQuery(api.app.users.getCurrentUser);
  const createCheckoutSession = useAction(api.app.stripe.createCheckoutSession);

  const handleCreateCheckoutSession = async (priceId: string) => {
    if (!user) {
      toast.error("User not found. Please refresh the page.");
      return;
    }

    setIsCreatingSession(true);
    
    try {
      const url = await createCheckoutSession({ 
        priceId, 
        mode: "payment" as const 
      });
      
      if (url) {
        router.push(url);
      } else {
        toast.error("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Show nothing while loading user data
  if (user === undefined) {
    return null;
  }

  // Show error state if user failed to load
  if (user === null) {
    return (
      <div className={cn("flex items-center gap-2 text-destructive", className)}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Failed to load credits</span>
      </div>
    );
  }

  const totalCredits = calculateTotalCredits(user);
  const userHasSubscription = hasActiveSubscription(user);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-1">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="font-semibold" aria-label={`${totalCredits} credits available`}>
          {totalCredits}
        </span>
      </div>
      <CreditsDialog 
        onSelectCredits={handleCreateCheckoutSession}
        hasSubscription={userHasSubscription}
        disabled={isCreatingSession}
      />
    </div>
  );
} 