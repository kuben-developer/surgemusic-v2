"use client";

import { useState } from "react";
import { FileText, MessageSquare, Sparkles, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SubscriptionDialog } from "./SubscriptionDialog";

interface LyricsSelectionProps {
  selectedLyricsOption: "lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null;
  setSelectedLyricsOption: (option: "lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null) => void;
  lyricsOptionError: boolean;
  isSubscribed: boolean;
}

export function LyricsSelection({
  selectedLyricsOption,
  setSelectedLyricsOption,
  lyricsOptionError,
  isSubscribed,
}: LyricsSelectionProps) {
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedFeatureDescription, setSelectedFeatureDescription] = useState("");

  const handleOptionClick = (
    option: "lyrics" | "lyrics-hooks" | "hooks" | "video-only",
    requiresPro: boolean,
    featureDescription?: string
  ) => {
    if (requiresPro && !isSubscribed) {
      setSelectedFeatureDescription(featureDescription || "");
      setShowSubscriptionDialog(true);
      return;
    }
    setSelectedLyricsOption(selectedLyricsOption === option ? null : option);
  };

  return (
    <>
      <section className={`bg-card rounded-xl p-8 shadow-sm border ${lyricsOptionError ? 'ring-2 ring-red-500' : ''}`}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b">
            <MessageSquare className="w-7 h-7" />
            <h2 className="text-2xl font-semibold">Select Lyrics & Captions</h2>
          </div>
          <p className="text-muted-foreground text-lg">Choose how you want lyrics and captions to appear in your videos.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lyrics Option (Pro) */}
            <button
              onClick={() => handleOptionClick(
                "lyrics",
                true,
                "Generate professional lyrics synchronized with your music. Perfect for lyric videos and music content."
              )}
              className={`relative w-full flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${
                selectedLyricsOption === "lyrics" ? "ring-2 ring-primary" : ""
              }`}
            >
              {!isSubscribed && (
                <Badge className="absolute top-2 right-2 gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                  <Sparkles className="w-3 h-3" />
                  Pro Plan
                </Badge>
              )}
              <div className="p-3 rounded-lg bg-background">
                <FileText className="w-8 h-8" />
              </div>
              <span className="text-xl font-medium">Lyrics</span>
            </button>

            {/* Lyrics + Viral Hooks Option (Pro) */}
            <button
              onClick={() => handleOptionClick(
                "lyrics-hooks",
                true,
                "Create engaging content with both lyrics and viral hooks. Maximize engagement with dynamic captions."
              )}
              className={`relative w-full flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${
                selectedLyricsOption === "lyrics-hooks" ? "ring-2 ring-primary" : ""
              }`}
            >
              {!isSubscribed && (
                <Badge className="absolute top-2 right-2 gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                  <Sparkles className="w-3 h-3" />
                  Pro Plan
                </Badge>
              )}
              <div className="p-3 rounded-lg bg-background">
                <MessageSquare className="w-8 h-8" />
              </div>
              <span className="text-xl font-medium">Lyrics + Viral Hooks</span>
            </button>

            {/* Viral Hooks Only */}
            <button
              onClick={() => handleOptionClick("hooks", false)}
              className={`w-full flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${
                selectedLyricsOption === "hooks" ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="p-3 rounded-lg bg-background">
                <Sparkles className="w-8 h-8" />
              </div>
              <span className="text-xl font-medium">Viral Hooks</span>
            </button>

            {/* Video Only */}
            <button
              onClick={() => handleOptionClick("video-only", false)}
              className={`w-full flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${
                selectedLyricsOption === "video-only" ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="p-3 rounded-lg bg-background">
                <Video className="w-8 h-8" />
              </div>
              <span className="text-xl font-medium">Video Only</span>
            </button>
          </div>
        </div>
      </section>

      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        featureDescription={selectedFeatureDescription}
      />
    </>
  );
}