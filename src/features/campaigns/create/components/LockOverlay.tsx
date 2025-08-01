"use client";

import Link from "next/link";
import { CreditsDialog } from "@/features/credits";

interface LockOverlayProps {
  isLocked: boolean;
  isSubscribed: boolean;
}

export function LockOverlay({ isLocked, isSubscribed }: LockOverlayProps) {
  if (!isLocked) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="flex flex-col items-center gap-3 p-4">
        {!isSubscribed ? (
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Subscribe to Generate Videos
          </Link>
        ) : (
          <CreditsDialog
            onSelectCredits={() => { }}
            hasSubscription={isSubscribed}
          />
        )}
      </div>
    </div>
  );
}