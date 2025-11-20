"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, CheckCircle } from "lucide-react";

export type VideoView = "airtable" | "ready-to-publish";

interface ViewToggleProps {
  view: VideoView;
  onViewChange: (view: VideoView) => void;
  readyCount?: number;
}

export function ViewToggle({ view, onViewChange, readyCount = 0 }: ViewToggleProps) {
  return (
    <Tabs value={view} onValueChange={(v) => onViewChange(v as VideoView)}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="airtable" className="cursor-pointer flex items-center gap-2">
          <Video className="size-4" />
          Airtable Videos
        </TabsTrigger>
        <TabsTrigger value="ready-to-publish" className="cursor-pointer flex items-center gap-2">
          <CheckCircle className="size-4" />
          Ready to Publish
          {readyCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {readyCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
