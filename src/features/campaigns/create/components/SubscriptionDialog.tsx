"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureDescription: string;
  isFirstTimeUser?: boolean;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  featureDescription,
  isFirstTimeUser = true,
}: SubscriptionDialogProps) {
  const router = useRouter();

  const handleViewPlans = () => {
    router.push("/pricing");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl">Upgrade to Access Pro Features</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Available on {isFirstTimeUser ? "Free Trial, " : ""}Growth plan and above
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            {featureDescription}
          </p>

          <div className="space-y-3">
            <p className="font-medium">With Pro access, you'll get:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Access to all Pro features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Advanced lyrics generation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">AI-powered transcription</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Priority video processing</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            {isFirstTimeUser 
              ? "Start your free trial or upgrade to the Growth plan (or above) to unlock all Pro features." 
              : "Upgrade to the Growth plan (or above) to unlock all Pro features."} Note: Starter plan does not include Pro features.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button
            onClick={handleViewPlans}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          >
            View Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}