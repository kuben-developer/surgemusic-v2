"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { useCampaignCaptions } from "../hooks/useCampaignCaptions";
import type { Caption } from "../types/media.types";

interface CaptionsSectionProps {
  campaignId: string;
}

export function CaptionsSection({ campaignId }: CaptionsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCaptionText, setNewCaptionText] = useState("");
  const [isAddingCaption, setIsAddingCaption] = useState(false);

  const {
    captions,
    captionCount,
    isLoading,
    isUploading,
    addCaption,
    uploadCaptionFile,
    removeCaption,
  } = useCampaignCaptions(campaignId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".txt")) {
      alert("Please upload a .txt file");
      return;
    }

    await uploadCaptionFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddCaption = async () => {
    if (!newCaptionText.trim()) return;

    setIsAddingCaption(true);
    try {
      await addCaption(newCaptionText);
      setNewCaptionText("");
      setShowAddInput(false);
    } finally {
      setIsAddingCaption(false);
    }
  };

  const handleRemoveCaption = async (captionId: string) => {
    if (confirm("Are you sure you want to delete this caption?")) {
      await removeCaption(captionId as any);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Captions</h3>
          {captionCount > 0 && (
            <Badge variant="secondary">{captionCount} captions</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddInput(true)}
            disabled={showAddInput}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Caption
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload .txt File
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Add Caption Input */}
      {showAddInput && (
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter caption text..."
              value={newCaptionText}
              onChange={(e) => setNewCaptionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCaption();
                } else if (e.key === "Escape") {
                  setShowAddInput(false);
                  setNewCaptionText("");
                }
              }}
              autoFocus
            />
            <Button
              onClick={handleAddCaption}
              disabled={!newCaptionText.trim() || isAddingCaption}
            >
              {isAddingCaption ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddInput(false);
                setNewCaptionText("");
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Captions List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading captions...
        </div>
      ) : captions && captions.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {captions.map((caption: Caption) => (
            <Card key={caption._id} className="p-3 flex items-start justify-between gap-2">
              <p className="flex-1 text-sm">{caption.text}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCaption(caption._id)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No captions yet</p>
          <p className="text-sm text-muted-foreground">
            Upload a .txt file with one caption per line, or add captions manually
          </p>
        </Card>
      )}
    </div>
  );
}
