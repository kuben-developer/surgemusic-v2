'use client';

import { cn } from '@/lib/utils';
import type { StatusBadgeProps } from '../types/pricing.types';

const badgeVariants = {
  popular: {
    containerClass: 'bg-primary/10 text-primary',
    text: 'Most Popular'
  },
  current: {
    containerClass: 'bg-green-500/10 text-green-500',
    text: 'Current Plan'
  },
  trial: {
    containerClass: 'bg-orange-500/10 text-orange-500',
    text: 'Trial Active'
  }
} as const;

export function StatusBadge({ type, text }: StatusBadgeProps) {
  const variant = badgeVariants[type];
  const displayText = text || variant.text;

  return (
    <span
      className={cn(
        'inline-block text-xs font-semibold px-3 py-1 rounded-full',
        variant.containerClass
      )}
    >
      {displayText}
    </span>
  );
}