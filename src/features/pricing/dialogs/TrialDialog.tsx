'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, CheckCircle2, Clock, CreditCard, Zap, Lock } from 'lucide-react';
import type { TrialDialogProps } from '../types/pricing.types';

export function TrialDialog({
  isOpen,
  onOpenChange,
  selectedPlan,
  interval,
  onStartTrial,
}: TrialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Start Your 3-Day Free Trial</DialogTitle>
          <DialogDescription className="pt-3 text-base">
            Experience the power of {selectedPlan?.name} with our risk-free trial
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/60 to-primary/0" />
              <h4 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Clock className="h-5 w-5 text-primary" />
                Trial Period Benefits
              </h4>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">5 Video Generations</p>
                    <p className="text-sm text-muted-foreground">Start creating viral content immediately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Lock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Premium Features Unlocked</p>
                    <p className="text-sm text-muted-foreground">Full access to all {selectedPlan?.name} features</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 w-[2px] bg-gradient-to-t from-primary/60 to-primary/0" />
              <h4 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                After Trial Activation
              </h4>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Automatic Upgrade to {selectedPlan?.name} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedPlan?.price}/{interval} • {selectedPlan?.videoGenerations} videos per {interval}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Flexible Cancellation</p>
                    <p className="text-sm text-muted-foreground">Cancel anytime during the trial with no charges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:w-full"
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              if (selectedPlan) {
                onStartTrial(selectedPlan);
              }
            }}
            className="sm:w-full gap-2"
          >
            <Zap className="h-4 w-4" />
            Start Free Trial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}