"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CropCanvas } from "./CropCanvas";
import { KeyframeStrip } from "./KeyframeStrip";
import { getEffectiveCrop } from "../utils/crop.utils";
import type { CropRegion } from "../../shared/types/podcast-clipper.types";
import type { SceneTypeCropState } from "../types/calibration.types";

interface SceneTypeCardProps {
  sceneType: SceneTypeCropState;
  sourceWidth: number;
  sourceHeight: number;
  onCropChange: (crop: CropRegion) => void;
  onAltCropChange: (crop: CropRegion) => void;
  onToggleAltCrop: (enabled: boolean) => void;
  onSelectKeyframe: (index: number | null) => void;
  onKeyframeCropChange: (keyframeIndex: number, crop: CropRegion) => void;
  onKeyframeAltCropChange: (keyframeIndex: number, altCrop: CropRegion) => void;
}

export function SceneTypeCard({
  sceneType,
  sourceWidth,
  sourceHeight,
  onCropChange,
  onAltCropChange,
  onToggleAltCrop,
  onSelectKeyframe,
  onKeyframeCropChange,
  onKeyframeAltCropChange,
}: SceneTypeCardProps) {
  const selectedKfIndex = sceneType.selectedKeyframeIndex;
  const isEditingKeyframe = selectedKfIndex !== null;

  // Determine which frame URL and crop to show
  let activeFrameUrl = sceneType.frameUrl;
  let activeCrop = sceneType.crop;
  let activeAltCrop = sceneType.altCrop;

  if (isEditingKeyframe && sceneType.keyframes[selectedKfIndex]) {
    const kf = sceneType.keyframes[selectedKfIndex];
    activeFrameUrl = kf.frameUrl || sceneType.frameUrl;

    // Get effective crop (walks backwards to find nearest set crop, falls back to default)
    const effective = getEffectiveCrop(
      sceneType.keyframes,
      selectedKfIndex,
      sceneType.crop,
      sceneType.altCrop,
    );
    activeCrop = effective.crop;
    activeAltCrop = effective.altCrop;
  }

  const handleCropChange = (crop: CropRegion) => {
    if (isEditingKeyframe) {
      onKeyframeCropChange(selectedKfIndex, crop);
    } else {
      onCropChange(crop);
    }
  };

  const handleAltCropChange = (altCrop: CropRegion) => {
    if (isEditingKeyframe) {
      onKeyframeAltCropChange(selectedKfIndex, altCrop);
    } else {
      onAltCropChange(altCrop);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Camera Angle {sceneType.sceneTypeId + 1}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor={`alt-${sceneType.sceneTypeId}`} className="text-sm text-muted-foreground">
              Alt Crop
            </Label>
            <Switch
              id={`alt-${sceneType.sceneTypeId}`}
              checked={sceneType.hasAltCrop}
              onCheckedChange={onToggleAltCrop}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keyframe strip */}
        {sceneType.keyframes.length > 0 && (
          <KeyframeStrip
            keyframes={sceneType.keyframes}
            selectedIndex={sceneType.selectedKeyframeIndex}
            onSelect={onSelectKeyframe}
          />
        )}

        {/* Primary crop */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">
            Primary Crop{isEditingKeyframe ? " (keyframe override)" : ""}
          </p>
          <CropCanvas
            frameUrl={activeFrameUrl}
            sourceWidth={sourceWidth}
            sourceHeight={sourceHeight}
            crop={activeCrop}
            onCropChange={handleCropChange}
          />
          <p className="text-xs text-muted-foreground">
            {activeCrop.width}x{activeCrop.height} at ({activeCrop.x}, {activeCrop.y})
          </p>
        </div>

        {/* Alt crop */}
        {sceneType.hasAltCrop && activeAltCrop && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Alternating Crop{isEditingKeyframe ? " (keyframe override)" : ""}
            </p>
            <CropCanvas
              frameUrl={activeFrameUrl}
              sourceWidth={sourceWidth}
              sourceHeight={sourceHeight}
              crop={activeAltCrop}
              onCropChange={handleAltCropChange}
            />
            <p className="text-xs text-muted-foreground">
              {activeAltCrop.width}x{activeAltCrop.height} at ({activeAltCrop.x}, {activeAltCrop.y})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
