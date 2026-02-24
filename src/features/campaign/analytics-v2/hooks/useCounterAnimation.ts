"use client";

import { useState, useEffect, useRef } from "react";

interface UseCounterAnimationOptions {
  duration?: number;
  ease?: "linear" | "easeOut" | "easeInOut";
  /** Key that, when changed, causes the counter to snap instantly (no animation) for a cooldown period. */
  snapKey?: string;
}

/** How long after a snapKey change to keep suppressing animations (ms). */
const SNAP_COOLDOWN_MS = 2000;

export function useCounterAnimation(
  target: number,
  options: UseCounterAnimationOptions = {},
) {
  const { duration = 1200, ease = "easeOut", snapKey } = options;
  const [current, setCurrent] = useState(target);
  const animationRef = useRef<number | null>(null);
  const prevSnapKeyRef = useRef(snapKey);
  const snapTimeRef = useRef(0);

  useEffect(() => {
    // Detect snapKey change and record when it happened
    if (prevSnapKeyRef.current !== snapKey) {
      prevSnapKeyRef.current = snapKey;
      snapTimeRef.current = Date.now();
    }

    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // If within cooldown window after a snapKey change, jump instantly
    if (Date.now() - snapTimeRef.current < SNAP_COOLDOWN_MS) {
      setCurrent(target);
      return;
    }

    if (target === current || typeof target !== "number" || isNaN(target))
      return;

    const startValue = current;
    const difference = target - startValue;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let easedProgress: number;
      switch (ease) {
        case "linear":
          easedProgress = progress;
          break;
        case "easeOut":
          easedProgress = 1 - Math.pow(1 - progress, 3);
          break;
        case "easeInOut":
          easedProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          break;
        default:
          easedProgress = progress;
      }

      const newValue = startValue + difference * easedProgress;
      setCurrent(Math.round(newValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, snapKey]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return current;
}
