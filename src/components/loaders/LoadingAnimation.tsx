'use client';

import { motion } from "framer-motion";

interface LoadingAnimationProps {
  text?: string;
  className?: string;
}

export function LoadingAnimation({ 
  text = "Loading", 
  className = "" 
}: LoadingAnimationProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-8 ${className}`}>
      {/* Main loader container */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Morphing thick square to circle */}
        <motion.div
          className="absolute w-16 h-16 border-4 border-foreground/25"
          animate={{
            borderRadius: ["20%", "50%", "20%"],
            rotate: [0, 180],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Center dancing bars */}
        <div className="flex items-end gap-1.5 h-8">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2.5 bg-foreground/35 rounded-full"
              animate={{
                height: ["10px", "32px", "10px"],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Text and progress */}
      <div className="flex flex-col items-center gap-3">
        <motion.p
          className="text-sm font-semibold text-foreground/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
        
        {/* Simple progress bar */}
        <motion.div
          className="w-36 h-1.5 bg-foreground/10 overflow-hidden rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full w-1/3 bg-foreground/30 rounded-full"
            animate={{
              x: ["-100%", "400%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}