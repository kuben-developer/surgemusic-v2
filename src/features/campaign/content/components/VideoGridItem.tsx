"use client";

import { Badge } from "@/components/ui/badge";
import { Film, Tag, Loader2 } from "lucide-react";
import type { AirtableContent } from "../../shared/types/campaign.types";
import { useEffect, useRef, useState } from "react";

interface VideoGridItemProps {
  video: AirtableContent;
}

export function VideoGridItem({ video }: VideoGridItemProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = containerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          // Once loaded, stop observing
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!video.video_url) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="group relative bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-primary/10 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="aspect-[9/16] bg-muted/30 relative overflow-hidden">
        {isInView ? (
          <video
            src={video.video_url}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            controls
            loop
            preload="metadata"
            style={{
              aspectRatio: "9 / 16",
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Account Niche Badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 gap-2 px-3 py-1.5 bg-background/50 backdrop-blur-md border-primary/20"
        >
          <Tag className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium">{video.account_niche}</span>
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        {/* Video Category */}
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{video.id}</span>
        </div>

        {/* API Post ID if available */}
        {video.api_post_id && (
          <Badge variant="outline" className="text-xs">
            Posted
          </Badge>
        )}
      </div>
    </div>
  );
}
