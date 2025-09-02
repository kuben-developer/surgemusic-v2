import type { PricingPlan, PlanName } from '../types/pricing.types';
import { formatVideoGenerations, formatUserProfiles } from '../utils/pricing.utils';

// Base plan configuration without pricing or Stripe integration
interface BasePlanConfig {
  readonly name: PlanName;
  readonly description: string;
  readonly videoGenerations: number;
  readonly userProfile: number;
  readonly baseFeatures: readonly string[];
}

// Stripe price ID environment variables mapping
const STRIPE_PRICE_IDS = {
  monthly: {
    Starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_M_PRICE!,
    Growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_M_PRICE!,
    Professional: process.env.NEXT_PUBLIC_STRIPE_PRO_M_PRICE!,
    Ultimate: process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_M_PRICE!,
  },
  yearly: {
    Starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_Y_PRICE!,
    Growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_Y_PRICE!,
    Professional: process.env.NEXT_PUBLIC_STRIPE_PRO_Y_PRICE!,
    Ultimate: process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_Y_PRICE!,
  },
} as const;

// Monthly pricing configuration
const MONTHLY_PRICES: Record<PlanName, number> = {
  Starter: 29,
  Growth: 99,
  Professional: 249,
  Ultimate: 990,
} as const;

// Base plan configurations
const BASE_PLANS: readonly BasePlanConfig[] = [
  {
    name: 'Starter',
    description: 'Perfect for testing your first release',
    videoGenerations: 60,
    userProfile: 1,
    baseFeatures: [
      '60 video generations',
      '1 user profile (connect up to 3 accounts)',
      'Access all content categories',
      '14 genre categories',
      '-Instant AI lyric transcription',
      'Auto-posting scheduler',
      'TikTok, Instagram, & YouTube Shorts posting',
      'Real-time analytics dashboard',
      '-Create shareable real-time analytics reports',
    ],
  },
  {
    name: 'Growth',
    description: 'Enhanced features & where artists scale',
    videoGenerations: 240,
    userProfile: 3,
    baseFeatures: [
      '240 video generations',
      '3 user profiles (connect up to 9 accounts)',
      'Access all content categories',
      '14 genre categories',
      'Instant AI lyric transcription',
      'Auto-posting scheduler',
      'TikTok, Instagram, & YouTube Shorts posting',
      'Real-time analytics dashboard',
      '-Create shareable real-time analytics reports',
    ],
  },
  {
    name: 'Professional',
    description: 'Designed for viral growth and even more videos',
    videoGenerations: 720,
    userProfile: 10,
    baseFeatures: [
      '720 video generations',
      '10 user profiles (connect up to 30 accounts)',
      'Access all content categories',
      '14 genre categories',
      'Instant AI lyric transcription',
      'Auto-posting scheduler',
      'TikTok, Instagram, & YouTube Shorts posting',
      'Real-time analytics dashboard',
      'Create shareable real-time analytics reports',
    ],
  },
  {
    name: 'Ultimate',
    description: 'Take over TikTok and flood the FYP with your music',
    videoGenerations: 3000,
    userProfile: 40,
    baseFeatures: [
      '3,000 video generations',
      '40 user profiles (connect 120 accounts)',
      'Access all content categories',
      '14 genre categories',
      'Instant AI lyric transcription',
      'Auto-posting scheduler',
      'TikTok, Instagram, & YouTube Shorts posting',
      'Real-time analytics dashboard',
      'Create shareable real-time analytics reports',
    ],
  },
] as const;

/**
 * Creates a complete pricing plan from base configuration
 */
function createPricingPlan(
  baseConfig: BasePlanConfig,
  price: number,
  interval: 'month' | 'year',
  videoGenerations: number
): PricingPlan {
  const features = [
    ...baseConfig.baseFeatures,
  ];

  // Map interval to STRIPE_PRICE_IDS key
  const stripeKey = interval === 'month' ? 'monthly' : 'yearly';

  return {
    name: baseConfig.name,
    price,
    description: baseConfig.description,
    videoGenerations,
    userProfile: baseConfig.userProfile,
    features,
    priceId: STRIPE_PRICE_IDS[stripeKey][baseConfig.name],
    interval,
  };
}

/**
 * Generates monthly plans from base configuration
 */
function generateMonthlyPlans(): readonly PricingPlan[] {
  return BASE_PLANS.map(baseConfig =>
    createPricingPlan(
      baseConfig,
      MONTHLY_PRICES[baseConfig.name],
      'month',
      baseConfig.videoGenerations
    )
  );
}

/**
 * Generates yearly plans with 20% discount
 */
function generateYearlyPlans(): readonly PricingPlan[] {
  return BASE_PLANS.map(baseConfig => {
    const monthlyPrice = MONTHLY_PRICES[baseConfig.name];
    const yearlyPrice = Math.floor(monthlyPrice * 10); // 20% discount
    const yearlyVideoGenerations = baseConfig.videoGenerations * 12;

    return createPricingPlan(
      baseConfig,
      yearlyPrice,
      'year',
      yearlyVideoGenerations
    );
  });
}

// Export the generated plans
export const monthlyPlans: readonly PricingPlan[] = generateMonthlyPlans();
export const yearlyPlans: readonly PricingPlan[] = generateYearlyPlans();

// Export individual plans for easy access
export const STARTER_MONTHLY = monthlyPlans[0];
export const PROFESSIONAL_MONTHLY = monthlyPlans[1];
export const ULTIMATE_MONTHLY = monthlyPlans[2];

export const STARTER_YEARLY = yearlyPlans[0];
export const PROFESSIONAL_YEARLY = yearlyPlans[1];
export const ULTIMATE_YEARLY = yearlyPlans[2];