import React from "react";
import { Info } from "lucide-react";

export function CreditExpirationNotice() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Info className="h-4 w-4 flex-shrink-0" />
      <span>
        Additional credits must be used before your next billing period as they do not carry over.
      </span>
    </div>
  );
}