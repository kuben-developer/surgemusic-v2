"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
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
  isVisible
}: TrialPromotionBannerProps) {
  const router = useRouter();

  const handleStartTrial = () => {
    router.push("/pricing");
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 p-6 rounded-xl bg-primary/5 border border-primary/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Your 30 videos have been generated!</h3>
            <p className="text-sm text-muted-foreground">
              Start a free trial to view them and unlock all features.
            </p>
          </div>
        </div>

        <Button
          onClick={handleStartTrial}
          className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          size="lg"
        >
          <Zap className="w-4 h-4 mr-2" />
          Start Free Trial
        </Button>
      </div>
    </div>
  );
}