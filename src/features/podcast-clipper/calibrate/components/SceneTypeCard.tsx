"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CropCanvas } from "./CropCanvas";
import type { CropRegion } from "../../shared/types/podcast-clipper.types";
import type { SceneTypeCropState } from "../types/calibration.types";

interface SceneTypeCardProps {
  sceneType: SceneTypeCropState;
  sourceWidth: number;
  sourceHeight: number;
  onCropChange: (crop: CropRegion) => void;
  onAltCropChange: (crop: CropRegion) => void;
  onToggleAltCrop: (enabled: boolean) => void;
}

export function SceneTypeCard({
  sceneType,
  sourceWidth,
  sourceHeight,
  onCropChange,
  onAltCropChange,
  onToggleAltCrop,
}: SceneTypeCardProps) {
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
        {/* Primary crop */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Primary Crop</p>
          <CropCanvas
            frameUrl={sceneType.frameUrl}
            sourceWidth={sourceWidth}
            sourceHeight={sourceHeight}
            crop={sceneType.crop}
            onCropChange={onCropChange}
          />
          <p className="text-xs text-muted-foreground">
            {sceneType.crop.width}x{sceneType.crop.height} at ({sceneType.crop.x}, {sceneType.crop.y})
          </p>
        </div>

        {/* Alt crop */}
        {sceneType.hasAltCrop && sceneType.altCrop && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Alternating Crop</p>
            <CropCanvas
              frameUrl={sceneType.frameUrl}
              sourceWidth={sourceWidth}
              sourceHeight={sourceHeight}
              crop={sceneType.altCrop}
              onCropChange={onAltCropChange}
            />
            <p className="text-xs text-muted-foreground">
              {sceneType.altCrop.width}x{sceneType.altCrop.height} at ({sceneType.altCrop.x}, {sceneType.altCrop.y})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
