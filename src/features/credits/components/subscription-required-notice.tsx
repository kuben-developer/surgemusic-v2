import React from "react";
import { Button } from "@/components/ui/button";
import { Info, ArrowRight } from "lucide-react";
import type { SubscriptionRequiredNoticeProps } from "../types/credits.types";

export function SubscriptionRequiredNotice({ onNavigateToPricing }: SubscriptionRequiredNoticeProps) {
  return (
    <div className="p-6 mt-3 rounded-lg bg-muted/50 border shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-medium text-foreground">Subscription Required</h4>
            <div className="text-sm text-muted-foreground leading-relaxed">
              An active non-trial subscription is required to purchase additional credits. 
              Our subscription plans come with monthly credits and premium features to help 
              you get the most out of our platform.
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="default"
            onClick={onNavigateToPricing}
            className="inline-flex items-center"
            type="button"
          >
            Explore Subscription Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}