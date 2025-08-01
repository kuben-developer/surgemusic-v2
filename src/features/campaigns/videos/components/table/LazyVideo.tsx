"use client"

import { useRef, useState, useEffect } from "react";

interface LazyVideoProps {
  videoUrl: string;
  className: string;
}

export function LazyVideo({ videoUrl, className }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    if (!videoRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 } // When 10% of the element is visible
    );
    
    observer.observe(videoRef.current);
    
    return () => {
      if (videoRef.current) observer.disconnect();
    };
  }, [videoRef]);
  
  return (
    <video
      ref={videoRef}
      src={isInView ? videoUrl : undefined}
      className={className}
      // Only add control attributes when it's in view and loaded
      {...(isInView ? { controls: false } : {})}
    />
  );
}