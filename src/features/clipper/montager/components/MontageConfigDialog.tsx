"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useClipperFolders } from "../../clipper/hooks/useClipperFolders";
import { useClipperClips } from "../../clipper/hooks/useClipperClips";
import { useMontageCreation } from "../hooks/useMontageCreation";
import { calculateMaxMontages } from "../utils/clip-distribution.utils";
import { Loader2, Film, FolderOpen } from "lucide-react";

interface MontageConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  onSuccess?: () => void;
}

type Step = "select-folders" | "set-count" | "confirm";

export function MontageConfigDialog({
  open,
  onOpenChange,
  folderName,
  onSuccess,
}: MontageConfigDialogProps) {
  const [step, setStep] = useState<Step>("select-folders");
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [numberOfMontages, setNumberOfMontages] = useState("1");
  const [configName, setConfigName] = useState("");
  const [totalClips, setTotalClips] = useState(0);

  const { folders, isLoading: foldersLoading } = useClipperFolders();
  const { createMontageConfig, isCreating } = useMontageCreation();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep("select-folders");
      setSelectedFolders([]);
      setNumberOfMontages("1");
      setConfigName("");
      setTotalClips(0);
    }
  }, [open]);

  // Fetch clips count when folders are selected
  useEffect(() => {
    const fetchClipsCount = async () => {
      if (selectedFolders.length === 0) {
        setTotalClips(0);
        return;
      }

      try {
        const { api } = await import("../../../../../convex/_generated/api");
        const { useAction } = await import("convex/react");

        // This is a workaround - we'll need to call the action directly
        // For now, let's estimate or fetch in the next step
        setTotalClips(0); // Will be calculated in step 2
      } catch (error) {
        console.error("Error fetching clips:", error);
      }
    };

    fetchClipsCount();
  }, [selectedFolders]);

  const handleToggleFolder = (folderName: string) => {
    setSelectedFolders((prev) =>
      prev.includes(folderName)
        ? prev.filter((f) => f !== folderName)
        : [...prev, folderName]
    );
  };

  const handleNext = () => {
    if (step === "select-folders") {
      if (selectedFolders.length === 0) {
        toast.error("Please select at least one clipper folder");
        return;
      }
      setStep("set-count");
    } else if (step === "set-count") {
      const count = parseInt(numberOfMontages, 10);
      if (isNaN(count) || count <= 0) {
        toast.error("Please enter a valid number of montages");
        return;
      }
      // Auto-generate config name with timestamp
      setConfigName(`config_${Date.now()}`);
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "set-count") {
      setStep("select-folders");
    } else if (step === "confirm") {
      setStep("set-count");
    }
  };

  const handleCreate = async () => {
    try {
      const count = parseInt(numberOfMontages, 10);

      const result = await createMontageConfig({
        folderName,
        configName,
        selectedClipperFolders: selectedFolders,
        numberOfMontages: count,
      });

      toast.success(
        `Successfully created configuration for ${result.montagesCreated} montages using ${result.totalClipsUsed} clips`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create configuration"
      );
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "select-folders":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Clipper Folders</Label>
              <p className="text-sm text-muted-foreground">
                Choose which clipper folders to pull clips from
              </p>
            </div>

            {foldersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <FolderOpen className="mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No clipper folders found. Create a clipper folder first.
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border p-4">
                {folders.map((folder) => (
                  <div
                    key={folder.name}
                    className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted"
                  >
                    <Checkbox
                      id={folder.name}
                      checked={selectedFolders.includes(folder.name)}
                      onCheckedChange={() => handleToggleFolder(folder.name)}
                    />
                    <label
                      htmlFor={folder.name}
                      className="flex flex-1 cursor-pointer items-center justify-between text-sm"
                    >
                      <span className="font-medium">{folder.name}</span>
                      <span className="text-muted-foreground">
                        {folder.clipCount} clips
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {selectedFolders.length > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm">
                  <span className="font-medium">{selectedFolders.length}</span>{" "}
                  {selectedFolders.length === 1 ? "folder" : "folders"} selected
                </p>
              </div>
            )}
          </div>
        );

      case "set-count":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="montage-count">Number of Montages</Label>
              <p className="text-sm text-muted-foreground">
                Each montage will randomly select 14 clips from your pool. Clips can be reused.
              </p>
              <Input
                id="montage-count"
                type="number"
                min="1"
                value={numberOfMontages}
                onChange={(e) => setNumberOfMontages(e.target.value)}
                placeholder="Enter number of montages"
              />
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Film className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium">Summary</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Selected folders: <span className="font-medium">{selectedFolders.join(", ")}</span>
                </p>
                <p>
                  Requested montages:{" "}
                  <span className="font-medium">{numberOfMontages || 0}</span>
                </p>
                <p>
                  Clips per montage:{" "}
                  <span className="font-medium">14 (randomly selected with reuse)</span>
                </p>
              </div>
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-medium">Configuration Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target folder:</span>
                  <span className="font-medium">{folderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source folders:</span>
                  <span className="font-medium">{selectedFolders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montages to create:</span>
                  <span className="font-medium">{numberOfMontages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clips per montage:</span>
                  <span className="font-medium">14 (random with reuse)</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
              <p className="font-medium mb-1">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Configuration file will be uploaded to S3</li>
                <li>Backend will randomly select clips from chosen folders</li>
                <li>Montages will be created and uploaded within a few minutes</li>
                <li>Check back here to view your completed montages</li>
              </ol>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Create Montage Configuration
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (Step {step === "select-folders" ? "1" : step === "set-count" ? "2" : "3"} of 3)
            </span>
          </DialogTitle>
          <DialogDescription>
            {step === "select-folders" &&
              "Select clipper folders to pull clips from"}
            {step === "set-count" &&
              "Specify how many montages to create"}
            {step === "confirm" &&
              "Review and confirm your configuration"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderStepContent()}</div>

        <DialogFooter>
          {step !== "select-folders" && (
            <Button variant="outline" onClick={handleBack} disabled={isCreating}>
              Back
            </Button>
          )}
          {step !== "confirm" ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Configuration"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
