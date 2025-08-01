import { motion } from "framer-motion";
import { animationVariants } from '../constants/animations.constants';

interface AnimatedReportLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable animated layout wrapper for report content
 */
export function AnimatedReportLayout({ 
  children, 
  className = "pt-8 pb-16 space-y-8" 
}: AnimatedReportLayoutProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={animationVariants.staggerContainer}
    >
      {children}
    </motion.div>
  );
}