import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { CreditOptionCardProps } from "../types/credits.types";

export function CreditOptionCard({ 
  option, 
  onSelect, 
  isLoading, 
  disabled, 
  hasSubscription 
}: CreditOptionCardProps) {
  const isOptionDisabled = disabled || !hasSubscription;
  
  const getButtonText = () => {
    if (isLoading) return "Processing...";
    if (!hasSubscription) return "Subscribe First";
    return "Buy Now";
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="mr-1 h-4 w-4 animate-spin" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
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
          onClick={() => onSelect(option.priceId)}
          disabled={isOptionDisabled}
          type="button"
          aria-label={`Purchase ${option.credits} credits for $${option.price}`}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
}