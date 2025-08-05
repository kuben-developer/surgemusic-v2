'use client';

import { LoadingAnimation } from "./LoadingAnimation";

interface PageLoaderProps {
  text?: string;
  minHeight?: string;
}

export function PageLoader({ 
  text = "Loading", 
  minHeight = "50vh" 
}: PageLoaderProps) {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div 
        className="flex items-center justify-center"
        style={{ minHeight }}
      >
        <LoadingAnimation text={text} />
      </div>
    </div>
  );
}