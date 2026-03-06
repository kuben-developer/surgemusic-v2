"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";

interface ProcessClipsButtonProps {
  approvedCount: number;
  onProcess: () => Promise<void>;
}

export function ProcessClipsButton({ approvedCount, onProcess }: ProcessClipsButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await onProcess();
    } finally {
      setIsProcessing(false);
    }
  };

  if (approvedCount === 0) return null;

  return (
    <Button onClick={handleProcess} disabled={isProcessing}>
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Process {approvedCount} Clip(s)
        </>
      )}
    </Button>
  );
}
