"use client";

import { Scissors } from "lucide-react";

interface ClipperHeaderProps {
  title: string;
  description?: string;
}

export function ClipperHeader({ title, description }: ClipperHeaderProps) {
  return (
    <div className="pb-6 border-b">
      <div className="flex items-center gap-4 mb-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <Scissors className="size-7 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        </div>
      </div>
      {description && (
        <p className="text-muted-foreground text-base max-w-3xl">{description}</p>
      )}
    </div>
  );
}
