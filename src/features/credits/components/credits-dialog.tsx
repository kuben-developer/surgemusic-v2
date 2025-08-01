"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Info, ArrowRight } from "lucide-react";
import { useState } from "react";
import { CREDIT_OPTIONS } from "../constants/credit-options";
import { useCredits } from "../hooks/useCredits";


interface CreditsDialogProps {
  onSelectCredits: (priceId: string) => void;
  hasSubscription: boolean;
}

export function CreditsDialog({ onSelectCredits, hasSubscription }: CreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const { loadingPriceId, handleSelectCredits } = useCredits();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="px-4">
          Add credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Purchase Additional Credits</DialogTitle>
          <div className="space-y-4">
            {!hasSubscription ? (
              <div className="p-6 mt-3 rounded-lg bg-muted/50 border shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">Subscription Required</h4>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        An active non-trial subscription is required to purchase additional credits. Our subscription plans come with monthly credits and premium features to help you get the most out of our platform.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="default"
                      onClick={() => window.location.href = '/pricing'}
                      className="inline-flex items-center"
                    >
                      Explore Subscription Plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Additional credits must be used before your next billing period as they do not carry over.</span>
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {CREDIT_OPTIONS.map((option) => (
            <div
              key={option.credits}
              className="flex flex-col items-center justify-between p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold">{option.credits} Credits</span>
                  <option.icon className={`w-5 h-5 ${option.iconColor}`} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate {option.credits} additional videos
                </p>
              </div>
              <div className="mt-4 space-y-4 w-full">
                <div className="text-3xl font-bold text-center">${option.price}</div>
                <Button
                  className="w-full"
                  onClick={() => handleSelectCredits(option.priceId, onSelectCredits)}
                  disabled={!hasSubscription || loadingPriceId === option.priceId}
                >
                  {loadingPriceId === option.priceId ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : !hasSubscription ? (
                    "Subscribe First"
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 