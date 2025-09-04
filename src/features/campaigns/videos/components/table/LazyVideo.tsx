"use client"

import { useRef, useState, useEffect } from "react";
import type { MouseEvent } from "react";

interface LazyVideoProps {
  videoUrl: string;
  className: string;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  hoverPlay?: boolean; // Autoplay on hover if true
  autoPlay?: boolean; // Start playing when visible/mounted
  preferUnmuted?: boolean; // Try to play with sound first
  clickToUnmute?: boolean; // Allow click to unmute and play with sound
}

export function LazyVideo({
  videoUrl,
  className,
  muted = true,
  loop = true,
  playsInline = true,
  hoverPlay = false,
  autoPlay = false,
  preferUnmuted = false,
  clickToUnmute = false,
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [currentMuted, setCurrentMuted] = useState<boolean>(muted);

  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.disconnect();
    };
  }, [videoRef]);

  // Keep element's muted in sync with state
  useEffect(() => {
    const el = videoRef.current;
    if (el) el.muted = currentMuted;
  }, [currentMuted]);

  // Helper: attempt to play, trying unmuted first if requested, falling back to muted
  const tryPlay = async () => {
    const el = videoRef.current;
    if (!el) return;
    try {
      if (preferUnmuted && currentMuted) {
        // Try unmuted first
        el.muted = false;
        setCurrentMuted(false);
      } else {
        el.muted = currentMuted;
      }
      await el.play();
    } catch (_err) {
      // Fallback to muted if autoplay with sound is blocked
      try {
        el.muted = true;
        setCurrentMuted(true);
        await el.play();
      } catch {
        // Give up silently
      }
    }
  };

  // If autoPlay is requested, start playback when in view and ready
  useEffect(() => {
    if (!autoPlay) return;
    const el = videoRef.current;
    if (!el || !isInView) return;
    void tryPlay();
  }, [autoPlay, isInView]);

  const handleMouseEnter = (_e: MouseEvent<HTMLVideoElement>) => {
    if (!hoverPlay) return;
    const el = videoRef.current;
    if (!el) return;
    void tryPlay();
  };

  const handleMouseLeave = (_e: MouseEvent<HTMLVideoElement>) => {
    if (!hoverPlay) return;
    const el = videoRef.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // noop
    }
  };

  const handleClick = () => {
    if (!clickToUnmute) return;
    const el = videoRef.current;
    if (!el) return;
    setCurrentMuted(false);
    void tryPlay();
  };

  return (
    <video
      ref={videoRef}
      src={isInView ? videoUrl : undefined}
      className={className}
      // Keep the UI minimal
      controls={false}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload="metadata"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
}
