"use client";

import { Film } from "lucide-react";

export function MontagerPlaceholder() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <Film className="size-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Montager Coming Soon</h2>
        <p className="max-w-md text-muted-foreground">
          The montage builder will allow you to select clips and create amazing
          video montages. Stay tuned!
        </p>
      </div>
    </div>
  );
}
