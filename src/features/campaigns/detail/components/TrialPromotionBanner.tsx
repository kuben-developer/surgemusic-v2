"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface TrialPromotionBannerProps {
  /** Whether the banner should be shown */
  isVisible: boolean;
  /** Callback when trial is successfully started */
  onTrialSuccess: () => void;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

export function TrialPromotionBanner({
  isVisible,
  onTrialSuccess,
  onDismiss
}: TrialPromotionBannerProps) {
  const router = useRouter();

  const handleStartTrial = () => {
    router.push("/pricing");
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Your 30 videos have been generated!</h3>
            <p className="text-sm text-muted-foreground">
              Start a free trial to view them and unlock all features.
            </p>
          </div>
        </div>
        <Button
          onClick={handleStartTrial}
          className="whitespace-nowrap"
        >
          Start Free Trial
        </Button>
      </div>
    </div>
  );
}