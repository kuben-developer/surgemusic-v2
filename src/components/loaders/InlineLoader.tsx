'use client';

import { motion } from "framer-motion";

interface InlineLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InlineLoader({ 
  size = "md",
  className = "" 
}: InlineLoaderProps) {
  const sizeConfig = {
    sm: { container: "w-4 h-4", bar: "w-0.5", heights: ["3px", "12px", "3px"] },
    md: { container: "w-6 h-6", bar: "w-1", heights: ["4px", "16px", "4px"] },
    lg: { container: "w-8 h-8", bar: "w-1.5", heights: ["6px", "24px", "6px"] },
  };

  const config = sizeConfig[size];

  return (
    <div className={`inline-flex items-center justify-center ${config.container} ${className}`}>
      <div className="flex items-end gap-0.5 h-full">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`${config.bar} bg-foreground/35 rounded-full`}
            animate={{
              height: config.heights,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}