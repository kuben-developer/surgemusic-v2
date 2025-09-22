"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Play, Download, Calendar, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { monthlyPlans } from "@/features/pricing/constants/plans.constants";

interface TrialOptInOverlayProps {
  isVisible: boolean;
  onTrialSuccess: () => void;
}

export function TrialOptInOverlay({ isVisible, onTrialSuccess }: TrialOptInOverlayProps) {
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false);

  const createCheckoutSession = useAction(api.app.stripe.createCheckoutSession);

  const handleStartTrial = async () => {
    try {
      setIsStartingTrial(true);

      // Create trial checkout session for Growth plan
      const growthPlan = monthlyPlans.find(plan => plan.name === "Growth");
      if (!growthPlan) {
        throw new Error("Growth plan not found");
      }

      const checkoutUrl = await createCheckoutSession({
        priceId: growthPlan.priceId,
        trial: true,
        mode: "subscription"
      });

      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Failed to start trial:", error);
      toast.error("Failed to start trial. Please try again.");
    } finally {
      setIsStartingTrial(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Blur overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 backdrop-blur-md bg-black/20 z-40 rounded-xl"
      />

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute inset-0 flex items-center justify-center z-50 p-8"
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>

            {/* Title and Description */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">
                Your 24 videos have been generated!
              </h3>
              <p className="text-gray-600">
                Start your 3-day free trial to view them and unlock all Growth features.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <button
                onClick={() => setShowBenefitsDialog(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
              >
                What&apos;s included in the trial?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleStartTrial}
                disabled={isStartingTrial}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                size="lg"
              >
                {isStartingTrial ? (
                  "Starting Trial..."
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Start 3-Day Free Trial
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500">
                Cancel anytime. No credit card required for trial.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Benefits Dialog */}
      <Dialog open={showBenefitsDialog} onOpenChange={setShowBenefitsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Trial Benefits
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-green-600" />
                <span>View all your generated videos</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Schedule posts to social media</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Access to all Growth features</span>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <Download className="w-5 h-5 text-gray-500" />
                <span className="line-through">Download videos (Premium only)</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                After 3 days, you can continue with a paid plan or downgrade to free.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}