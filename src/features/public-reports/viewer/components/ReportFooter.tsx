'use client';

import { motion } from "framer-motion";
import { animationVariants } from '../constants/animations.constants';

/**
 * Footer component for public reports with read-only disclaimer
 */
export function ReportFooter() {
  return (
    <motion.div 
      variants={animationVariants.fadeInUp} 
      className="border-t pt-6 text-center text-sm text-muted-foreground"
    >
      <p>This report is shared in read-only mode. Contact the owner for more information.</p>
    </motion.div>
  );
}