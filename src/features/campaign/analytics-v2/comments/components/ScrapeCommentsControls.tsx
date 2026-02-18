"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrapeStatusBadge } from "./ScrapeStatusBadge";

interface ScrapeCommentsControlsProps {
  totalComments: number;
  selectedCount: number;
  lastScrapedAt: number | null;
  isActive: boolean;
  progressPercent: number;
  onStartScrape: (maxCommentsPerVideo: number) => void;
}

export function ScrapeCommentsControls({
  totalComments,
  selectedCount,
  lastScrapedAt,
  isActive,
  progressPercent,
  onStartScrape,
}: ScrapeCommentsControlsProps) {
  const [maxComments, setMaxComments] = useState(100);
  const [isOpen, setIsOpen] = useState(false);

  const handleScrape = () => {
    onStartScrape(maxComments);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Status */}
      <ScrapeStatusBadge
        totalComments={totalComments}
        selectedCount={selectedCount}
        lastScrapedAt={lastScrapedAt}
        isActive={isActive}
        progressPercent={progressPercent}
      />

      {/* Scrape Button with Settings */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isActive}
            className="gap-2"
          >
            {isActive ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Scraping...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Scrape Comments</span>
                <span className="sm:hidden">Scrape</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Scrape Settings</h4>
              <p className="text-sm text-muted-foreground">
                Fetch comments from all campaign videos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxComments">Max comments per video</Label>
              <Input
                id="maxComments"
                type="number"
                min={10}
                max={500}
                value={maxComments}
                onChange={(e) => setMaxComments(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Higher values take longer but capture more comments
              </p>
            </div>

            <Button
              onClick={handleScrape}
              className="w-full"
              disabled={isActive}
            >
              {totalComments > 0 ? "Update Comments" : "Start Scraping"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
