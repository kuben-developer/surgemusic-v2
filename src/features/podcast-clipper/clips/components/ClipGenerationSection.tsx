"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface ClipGenerationSectionProps {
  canGenerate: boolean;
  onGenerate: (params: {
    minClipDuration: number;
    maxClipDuration: number;
    minClipsPerHour: number;
    maxClipsPerHour: number;
  }) => Promise<void>;
}

export function ClipGenerationSection({ canGenerate, onGenerate }: ClipGenerationSectionProps) {
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(60);
  const [minPerHour, setMinPerHour] = useState(3);
  const [maxPerHour, setMaxPerHour] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({
        minClipDuration: minDuration,
        maxClipDuration: maxDuration,
        minClipsPerHour: minPerHour,
        maxClipsPerHour: maxPerHour,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Clips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          AI will analyze the transcript and find the most viral-worthy moments.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Min Duration (sec)</Label>
            <Input
              type="number"
              min={10}
              max={300}
              value={minDuration}
              onChange={(e) => setMinDuration(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max Duration (sec)</Label>
            <Input
              type="number"
              min={10}
              max={300}
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Min Clips/Hour</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={minPerHour}
              onChange={(e) => setMinPerHour(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max Clips/Hour</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={maxPerHour}
              onChange={(e) => setMaxPerHour(Number(e.target.value))}
            />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={!canGenerate || isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Clips
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
