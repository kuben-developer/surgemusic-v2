import { Zap, Rocket, Diamond, Flame } from "lucide-react";
import type { CreditOption } from "../types/credits.types";

export const CREDIT_OPTIONS: CreditOption[] = [
  {
    credits: 30,
    price: 24,
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_30_PRICE_ID!,
    icon: Flame,
    iconColor: "text-yellow-500",
  },
  {
    credits: 60,
    price: 42,
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_60_PRICE_ID!,
    icon: Zap,
    iconColor: "text-blue-500",
  },
  {
    credits: 90,
    price: 59,
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_90_PRICE_ID!,
    icon: Rocket,
    iconColor: "text-green-500",
  },
  {
    credits: 120,
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_120_PRICE_ID!,
    icon: Diamond,
    iconColor: "text-purple-500",
  },
];