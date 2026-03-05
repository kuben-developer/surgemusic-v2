"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCalibrationData } from "./hooks/useCalibrationData";
import { useSaveCropRegions } from "./hooks/useSaveCropRegions";
import { SceneTypeCard } from "./components/SceneTypeCard";
import { preloadImages } from "./components/CropCanvas";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { defaultCrop } from "./utils/crop.utils";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CropRegion } from "../shared/types/podcast-clipper.types";
import type { SceneTypeCropState, CropKeyframe } from "./types/calibration.types";

export function CalibrationPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as Id<"podcastClipperFolders">;

  const { folder, config, sceneTypes, cropKeyframes, isLoading } = useCalibrationData(folderId);
  const { saveCrops, isSaving } = useSaveCropRegions(folderId);

  const [cropStates, setCropStates] = useState<SceneTypeCropState[]>([]);

  // Initialize crop states from scene types + crop keyframes
  useEffect(() => {
    if (!sceneTypes || !config || cropStates.length > 0) return;

    const sourceW = config.sourceWidth;
    const sourceH = config.sourceHeight;

    setCropStates(
      sceneTypes.map((st) => {
        // Find keyframes belonging to this scene type
        const stKeyframes: CropKeyframe[] = (cropKeyframes ?? [])
          .filter((kf) => kf.sceneTypeId === st._id)
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((kf) => ({
            keyframeId: kf._id,
            sceneTypeId: kf.sceneTypeId,
            timestamp: kf.timestamp,
            frameUrl: kf.frameUrl ?? "",
            crop: kf.crop ?? null,
            altCrop: kf.altCrop ?? null,
          }));

        return {
          sceneTypeDbId: st._id,
          sceneTypeId: st.sceneTypeId,
          frameUrl: st.frameUrl ?? "",
          crop: st.crop ?? defaultCrop(sourceW, sourceH),
          altCrop: st.altCrop ?? defaultCrop(sourceW, sourceH),
          hasAltCrop: st.altCrop !== undefined && st.altCrop !== null,
          keyframes: stKeyframes,
          selectedKeyframeIndex: null,
        };
      })
    );
  }, [sceneTypes, config, cropKeyframes, cropStates.length]);

  // Preload all keyframe images once crop states are initialized
  const hasStates = cropStates.length > 0;
  useEffect(() => {
    if (!hasStates) return;
    const urls: string[] = [];
    for (const cs of cropStates) {
      if (cs.frameUrl) urls.push(cs.frameUrl);
      for (const kf of cs.keyframes) {
        if (kf.frameUrl) urls.push(kf.frameUrl);
      }
    }
    preloadImages(urls);
  }, [hasStates]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateCrop = (index: number, crop: CropRegion) => {
    setCropStates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, crop } : item))
    );
  };

  const updateAltCrop = (index: number, altCrop: CropRegion) => {
    setCropStates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, altCrop } : item))
    );
  };

  const toggleAltCrop = (index: number, enabled: boolean) => {
    setCropStates((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (enabled && config) {
          return {
            ...item,
            hasAltCrop: true,
            altCrop: item.altCrop ?? defaultCrop(config.sourceWidth, config.sourceHeight),
          };
        }
        return { ...item, hasAltCrop: false };
      })
    );
  };

  const selectKeyframe = (sceneIndex: number, keyframeIndex: number | null) => {
    setCropStates((prev) =>
      prev.map((item, i) =>
        i === sceneIndex ? { ...item, selectedKeyframeIndex: keyframeIndex } : item
      )
    );
  };

  const updateKeyframeCrop = (sceneIndex: number, keyframeIndex: number, crop: CropRegion) => {
    setCropStates((prev) =>
      prev.map((item, i) => {
        if (i !== sceneIndex) return item;
        const newKeyframes = item.keyframes.map((kf, ki) =>
          ki === keyframeIndex ? { ...kf, crop } : kf
        );
        return { ...item, keyframes: newKeyframes };
      })
    );
  };

  const updateKeyframeAltCrop = (sceneIndex: number, keyframeIndex: number, altCrop: CropRegion) => {
    setCropStates((prev) =>
      prev.map((item, i) => {
        if (i !== sceneIndex) return item;
        const newKeyframes = item.keyframes.map((kf, ki) =>
          ki === keyframeIndex ? { ...kf, altCrop } : kf
        );
        return { ...item, keyframes: newKeyframes };
      })
    );
  };

  const handleSave = async () => {
    await saveCrops(cropStates);
    router.push(`/podcast-clipper/${folderId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!folder || !config || !sceneTypes || sceneTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No scene types to configure</h3>
        <p className="text-muted-foreground mb-4">
          Run calibration first to detect camera angles.
        </p>
        <Button onClick={() => router.push(`/podcast-clipper/${folderId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Folder
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/podcast-clipper/${folderId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configure Crop Regions</h1>
            <p className="text-muted-foreground text-sm">
              {folder.folderName} &middot; {sceneTypes.length} camera angle(s) &middot;{" "}
              {config.sourceWidth}x{config.sourceHeight}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All
            </>
          )}
        </Button>
      </div>

      {/* Scene type cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cropStates.map((cropState, index) => (
          <SceneTypeCard
            key={cropState.sceneTypeDbId}
            sceneType={cropState}
            sourceWidth={config.sourceWidth}
            sourceHeight={config.sourceHeight}
            onCropChange={(crop) => updateCrop(index, crop)}
            onAltCropChange={(altCrop) => updateAltCrop(index, altCrop)}
            onToggleAltCrop={(enabled) => toggleAltCrop(index, enabled)}
            onSelectKeyframe={(kfIndex) => selectKeyframe(index, kfIndex)}
            onKeyframeCropChange={(kfIndex, crop) => updateKeyframeCrop(index, kfIndex, crop)}
            onKeyframeAltCropChange={(kfIndex, altCrop) => updateKeyframeAltCrop(index, kfIndex, altCrop)}
          />
        ))}
      </div>
    </div>
  );
}
