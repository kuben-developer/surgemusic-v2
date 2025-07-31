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
import { cn } from '@/lib/utils';
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

interface PricingPlan {
  name: string;
  price: number;
  description: string;
  videoGenerations: number;
  songs: number;
  features: string[];
  priceId: string;
  interval: 'month' | 'year';
}
import { Calendar, CheckCircle2, Clock, CreditCard, CreditCardIcon, Loader2, Lock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const monthlyPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: 39,
    description: 'Enhanced features and daily videos for a month.',
    videoGenerations: 30,
    songs: 1,
    features: [
      '30 video generations',
      '1 song',
      'All content categories & outputs',
      'Content calendar scheduler',
      'Purchase additional discounted credits',
      'Choice of US rap & UK rap theme content',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID!,
    interval: 'month',
  },
  {
    name: 'Professional',
    price: 99,
    description: 'Designed for viral growth and even more videos.',
    videoGenerations: 120,
    songs: 4,
    features: [
      '120 video generations',
      '4 songs',
      'All content categories & outputs',
      'Content calendar scheduler',
      'Purchase additional discounted credits',
      'Choice of US rap & UK rap theme content',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID!,
    interval: 'month',
  },
  {
    name: 'Ultimate',
    price: 249,
    description: 'Take over TikTok and flood the FYP with your music.',
    videoGenerations: 360,
    songs: 12,
    features: [
      '360 video generations',
      '12 songs',
      'All content categories & outputs',
      'Content calendar scheduler',
      'Purchase additional discounted credits',
      'Choice of US rap & UK rap theme content',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_MONTHLY_PRICE_ID!,
    interval: 'month',
  },
];

const yearlyPlans: PricingPlan[] = monthlyPlans.map(plan => ({
  name: plan.name,
  price: Math.floor(plan.price * 10),
  description: plan.description,
  videoGenerations: plan.videoGenerations * 12,
  songs: plan.songs,
  features: [
    `${plan.videoGenerations * 12} video generations`,
    ...plan.features.slice(1)
  ],
  interval: 'year',
  priceId: plan.name === 'Starter'
    ? process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID!
    : plan.name === 'Professional'
      ? process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_YEARLY_PRICE_ID!
      : process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_YEARLY_PRICE_ID!,
}));

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [trialDialogOpen, setTrialDialogOpen] = useState(false);
  const [convertedToPaidPlanLoading, setConvertedToPaidPlanLoading] = useState(false);
  const [isUserOnTrial, setIsUserOnTrial] = useState(false);
  const router = useRouter();

  const user = useQuery(api.users.getCurrentUser);
  const isLoading = user === undefined;
  const createCheckoutSessionAction = useAction(api.stripe.createCheckoutSession);
  
  const createCheckoutSession = async (params: { priceId: string; trial?: boolean }) => {
    try {
      const url = await createCheckoutSessionAction(params);
      if (url) {
        router.push(url);
      }
    } catch (error) {
      toast.error("Failed to create checkout session", {
        description: (error as Error).message
      });
    }
  };

  useEffect(() => {
    setIsUserOnTrial(user?.isTrial || false);
    if (user?.subscriptionPriceId) {
      const isYearlyPlan = yearlyPlans.some(plan => plan.priceId === user.subscriptionPriceId);
      setInterval(isYearlyPlan ? 'year' : 'month');
    }
  }, [user]);

  const endTrialImmediatelyAction = useAction(api.stripe.endTrialImmediately);
  
  const endTrialImmediately = async () => {
    try {
      const response = await endTrialImmediatelyAction();
      if (response.status === 'active') {
        setConvertedToPaidPlanLoading(false);
        setIsUserOnTrial(false);
        toast.success("Trial Ended Successfully.", {
          description: `Your paid plan is now active!`,
        });
      } else {
        setConvertedToPaidPlanLoading(false);
        toast.error('Payment Failed.', {
          description: 'Please contact support if this persists.',
        });
      }
    } catch (error) {
      setConvertedToPaidPlanLoading(false);
      toast.error('Error ending trial', {
        description: (error as Error).message,
      });
    }
  };


  const createPortalSessionAction = useAction(api.stripe.createCustomerPortalSession);
  
  const createPortalSession = async () => {
    try {
      const url = await createPortalSessionAction();
      if (url) {
        router.push(url);
      }
    } catch (error) {
      toast.error("Failed to create portal session", {
        description: (error as Error).message
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-8 shadow-lg">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-10 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-8" />
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <Skeleton className="h-5 w-5 flex-shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const plans = interval === 'month' ? monthlyPlans : yearlyPlans;
  const currentPlan = plans.find(plan => plan.priceId === user?.subscriptionPriceId);

  return (
    <div className={`container mx-auto px-4 ${isUserOnTrial ? 'pb-16 pt-6' : 'py-16'}`}>
      {isUserOnTrial && (
        <div className="mb-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Trial Period Active</h3>
                <p className="text-sm text-muted-foreground">You're currently on a trial of our {currentPlan?.name} plan. Convert to a paid plan to keep your benefits.</p>
              </div>
            </div>
            <Button
              onClick={() => {
                if (currentPlan?.priceId) {
                  setConvertedToPaidPlanLoading(true);
                  endTrialImmediately();
                }
              }}
              className="whitespace-nowrap"
              disabled={convertedToPaidPlanLoading}
            >
              {convertedToPaidPlanLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert to Paid Plan"
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-12 text-center">
        <div className="inline-flex items-center rounded-full border border-border p-1 bg-background">
          <button
            onClick={() => setInterval('month')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              interval === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('year')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              interval === 'year' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {user?.subscriptionPriceId && (
        <div className="mb-8 text-center">
          <Button
            onClick={() => void createPortalSession()}
            className="inline-flex items-center gap-2"
          >
            <CreditCardIcon className="h-4 w-4" />
            Manage Billing
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = plan.priceId === user?.subscriptionPriceId;
          const hasActivePlan = !!user?.subscriptionPriceId;

          return (
            <div
              key={plan.name}
              className={cn(
                "rounded-lg border border-border bg-card p-8 shadow-lg",
                plan.name === 'Professional' && "ring-2 ring-primary",
                isCurrentPlan && "ring-2 ring-green-500"
              )}
            >
              {plan.name === 'Professional' && (
                <div className="mb-4 -mt-2">
                  <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrentPlan && (
                <div className="mb-4 -mt-2">
                  <span className="inline-block bg-green-500/10 text-green-500 text-xs font-semibold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              <h3 className="text-xl font-semibold text-card-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-card-foreground">
                <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                <span className="ml-1 text-xl font-semibold">/{interval}</span>
              </div>
              <p className="mt-4 text-muted-foreground">{plan.description}</p>

              <div className="mt-8 space-y-3">
                {!user?.firstTimeUser ? null : (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setTrialDialogOpen(true);
                    }}
                  >
                    Try Free for 3 Days
                  </Button>
                )}
                <Button
                  className="w-full"
                  onClick={() => {
                    if (isCurrentPlan) {
                      void createPortalSession();
                    } else if (plan.priceId) {
                      void createCheckoutSession({
                        priceId: plan.priceId,
                      });
                    }
                  }}
                  disabled={plan.priceId === ''}
                >
                  {isCurrentPlan
                    ? isUserOnTrial
                      ? 'Current Trial Plan'
                      : 'Current Plan'
                    : hasActivePlan
                      ? 'Switch Plan'
                      : 'Buy Now'}
                </Button>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold text-card-foreground">What's Included</h4>
                <ul className="mt-4 space-y-4">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={trialDialogOpen} onOpenChange={setTrialDialogOpen}>
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
              onClick={() => setTrialDialogOpen(false)}
              className="sm:w-full"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                if (selectedPlan?.priceId) {
                  void createCheckoutSession({
                    priceId: selectedPlan.priceId,
                    trial: true
                  });
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
    </div>
  );
} 