"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

interface ClipGenerationSectionProps {
  canGenerate: boolean;
  getDefaultPrompt: (params: {
    minClipDuration: number;
    maxClipDuration: number;
    minClipsPerHour: number;
    maxClipsPerHour: number;
  }) => string;
  onGenerate: (params: {
    minClipDuration: number;
    maxClipDuration: number;
    minClipsPerHour: number;
    maxClipsPerHour: number;
    customPrompt?: string;
    model?: string;
  }) => Promise<void>;
}

export function ClipGenerationSection({ canGenerate, getDefaultPrompt, onGenerate }: ClipGenerationSectionProps) {
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(60);
  const [minPerHour, setMinPerHour] = useState(3);
  const [maxPerHour, setMaxPerHour] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [promptEdited, setPromptEdited] = useState(false);
  const [model, setModel] = useState("anthropic/claude-opus-4.6");
  const modelEdited = useRef(false);

  const currentParams = { minClipDuration: minDuration, maxClipDuration: maxDuration, minClipsPerHour: minPerHour, maxClipsPerHour: maxPerHour };

  // Auto-update prompt when params change (unless user has manually edited)
  useEffect(() => {
    if (!promptEdited) {
      setPromptText(getDefaultPrompt(currentParams));
    }
  }, [minDuration, maxDuration, minPerHour, maxPerHour, promptEdited, getDefaultPrompt]);

  // Initialize prompt text when prompt editor is first opened
  useEffect(() => {
    if (showPrompt && !promptText) {
      setPromptText(getDefaultPrompt(currentParams));
    }
  }, [showPrompt]);

  const handleResetPrompt = () => {
    setPromptText(getDefaultPrompt(currentParams));
    setPromptEdited(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({
        ...currentParams,
        customPrompt: promptEdited ? promptText : undefined,
        model: modelEdited.current ? model : undefined,
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

        {/* Collapsible prompt editor */}
        <div className="border rounded-lg">
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-left hover:bg-muted/50 transition-colors"
            onClick={() => setShowPrompt(!showPrompt)}
          >
            {showPrompt ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Customize Prompt
            {promptEdited && (
              <span className="text-xs text-orange-500 ml-auto">edited</span>
            )}
          </button>
          {showPrompt && (
            <div className="px-3 pb-3 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Model</Label>
                <Input
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    modelEdited.current = true;
                  }}
                  placeholder="anthropic/claude-opus-4.6"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">User Prompt</Label>
                  {promptEdited && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={handleResetPrompt}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to Default
                    </Button>
                  )}
                </div>
                <Textarea
                  value={promptText}
                  onChange={(e) => {
                    setPromptText(e.target.value);
                    setPromptEdited(true);
                  }}
                  rows={20}
                  className="font-mono text-xs leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  The full transcript will be appended automatically when generating.
                </p>
              </div>
            </div>
          )}
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
