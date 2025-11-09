"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

interface VideoCountHeaderProps {
  isSubscribed: boolean;
}

export function VideoCountHeader({ isSubscribed }: VideoCountHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3 pb-2 border-b">
        <Zap className="w-7 h-7" />
        <h2 className="text-2xl font-semibold">Number Of Videos To Generate</h2>
      </div>
      
      {!isSubscribed ? (
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <p className="text-lg font-medium text-primary">Subscription Required</p>
          <p className="text-muted-foreground mt-1">
            You need an active subscription to generate videos. Subscribe now to unlock video generation capabilities.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium mt-4"
          >
            View Subscription Plans
          </Link>
        </div>
      ) : (
        <p className="text-muted-foreground text-lg">
          Choose your campaign deliverables based on your available credits. Each video requires 1 credit to generate.
        </p>
      )}
    </>
  );
}