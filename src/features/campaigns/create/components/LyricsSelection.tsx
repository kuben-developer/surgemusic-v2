"use client";

import { useState } from "react";
import { Info, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LyricsFeatureDialog } from "./LyricsFeatureDialog";

interface LyricsSelectionProps {
  selectedLyricsOption: "lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null;
  setSelectedLyricsOption: (option: "lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null) => void;
  lyricsOptionError: boolean;
  hasProFeatures: boolean;
  isFirstTimeUser?: boolean;
}

const OPTIONS: Array<{
  key: "lyrics" | "lyrics-hooks" | "hooks" | "video-only";
  label: string;
  img: string;
  pro?: boolean;
  description?: string;
}> = [
    {
      key: "lyrics",
      label: "Lyrics",
      img: "/lyrics_and_hook/lyrics.gif",
      pro: true,
      description:
        "Auto-generate lyrics for all your videos - lyrics increase watch-time and increase chances of virality.",
    },
    {
      key: "lyrics-hooks",
      label: "Lyrics + Viral Hooks",
      img: "/lyrics_and_hook/lyrics_viral_hook.gif",
      pro: true,
      description:
        "Auto-generate lyrics for all your videos - lyrics increase watch-time and increase chances of virality.",
    },
    {
      key: "hooks",
      label: "Viral Hooks",
      img: "/lyrics_and_hook/viral_hook.gif",
    },
    {
      key: "video-only",
      label: "Video Only",
      img: "/lyrics_and_hook/video_only.gif",
    },
  ];

export function LyricsSelection({
  selectedLyricsOption,
  setSelectedLyricsOption,
  lyricsOptionError,
  hasProFeatures,
  isFirstTimeUser = true,
}: LyricsSelectionProps) {
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedFeatureDescription, setSelectedFeatureDescription] = useState("");

  const handleClick = (key: "lyrics" | "lyrics-hooks" | "hooks" | "video-only", pro?: boolean, desc?: string) => {
    if (pro && !hasProFeatures) {
      setSelectedFeatureDescription(desc || "");
      setShowSubscriptionDialog(true);
      return;
    }
    setSelectedLyricsOption(selectedLyricsOption === key ? null : key);
  };

  return (
    <>
      <section className={`bg-card rounded-xl p-8 shadow-sm border ${lyricsOptionError ? "ring-2 ring-red-500" : ""}`}>
        <div className="space-y-10">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b">
              <Zap className="w-7 h-7" />
              <h2 className="text-2xl font-semibold">Select Format</h2>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-lg">
                Choose how you want lyrics and viral hooks to appear in your videos.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>Pick one option. Click again to unselect.</span>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {OPTIONS.map((opt) => {
                const isSelected = selectedLyricsOption === opt.key;
                return (
                  <div key={opt.key} className="space-y-3">
                    <div className="relative aspect-[9/16] rounded-lg overflow-hidden border shadow-sm">
                      {opt.pro && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!hasProFeatures) {
                              setSelectedFeatureDescription(opt.description || "");
                              setShowSubscriptionDialog(true);
                            }
                          }}
                          className="absolute top-2 right-2"
                          aria-label="Growth Feature"
                        >
                          <Badge className="gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 cursor-pointer">
                            <Sparkles className="w-3 h-3" />Growth
                          </Badge>
                        </button>
                      )}
                      <img src={opt.img} alt={`${opt.label} preview`} className="w-full h-full object-cover" />
                    </div>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                      onClick={() => handleClick(opt.key, opt.pro, opt.description)}
                    >
                      {opt.label}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <LyricsFeatureDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        featureDescription={selectedFeatureDescription}
      />
    </>
  );
}
