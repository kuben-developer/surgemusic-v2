import type { PricingPlan } from '../types/pricing.types';

export const monthlyPlans: PricingPlan[] = [
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

export const yearlyPlans: PricingPlan[] = monthlyPlans.map(plan => ({
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