"use client";

import { useState, useEffect, useRef } from "react";

interface UseCounterAnimationOptions {
  duration?: number;
  ease?: "linear" | "easeOut" | "easeInOut";
}

export function useCounterAnimation(
  target: number,
  options: UseCounterAnimationOptions = {},
) {
  const { duration = 1200, ease = "easeOut" } = options;
  const [current, setCurrent] = useState(target);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(target);

  useEffect(() => {
    if (target === current || typeof target !== "number" || isNaN(target))
      return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = current;
    const difference = target - startValue;

    startTimeRef.current = performance.now();
    startValueRef.current = startValue;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
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
  }, [target, duration, ease, current]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return current;
}
