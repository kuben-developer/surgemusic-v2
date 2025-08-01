import type { Variants } from 'framer-motion';

// Common animation duration type
export type AnimationDuration = 'fast' | 'normal' | 'slow' | 'stagger';

// Common easing curve type  
export type EasingCurve = 'easeOut' | 'easeIn' | 'easeInOut' | 'bounce';

// Animation configuration interface
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: number[];
  staggerChildren?: number;
}

// Common motion variants interface
export interface MotionVariants {
  staggerContainer: Variants;
  fadeInUp: Variants;
  fadeIn: Variants;
  slideInLeft: Variants;
  slideInRight: Variants;
  scaleIn: Variants;
}

// Loading animation states
export type LoadingAnimationState = 'loading' | 'success' | 'error';

// Page transition configuration
export interface PageTransitionConfig {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
  transition: AnimationConfig;
}