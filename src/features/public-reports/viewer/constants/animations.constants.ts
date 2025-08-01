import type { Variants } from 'framer-motion';

// Reusable animation variants for consistent motion design
export const animationVariants = {
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  } as Variants,

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  } as Variants,

  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  } as Variants,

  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 }
  } as Variants,

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 }
  } as Variants,

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  } as Variants
};

// Common animation durations
export const animationDurations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  stagger: 0.1
} as const;

// Common easing curves
export const easingCurves = {
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55]
} as const;