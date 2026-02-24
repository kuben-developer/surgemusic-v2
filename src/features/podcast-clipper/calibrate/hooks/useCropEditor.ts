"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CropRegion } from "../../shared/types/podcast-clipper.types";
import { clampCrop, cropHeightFromWidth, roundEven } from "../utils/crop.utils";

interface UseCropEditorProps {
  sourceWidth: number;
  sourceHeight: number;
  initialCrop: CropRegion;
  onCropChange: (crop: CropRegion) => void;
}

export function useCropEditor({
  sourceWidth,
  sourceHeight,
  initialCrop,
  onCropChange,
}: UseCropEditorProps) {
  const [crop, setCrop] = useState<CropRegion>(initialCrop);
  const [pendingNotify, setPendingNotify] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragMode = useRef<"move" | "resize-left" | "resize-right">("move");
  const cropAtDragStart = useRef<CropRegion>(initialCrop);

  // Notify parent after crop state has settled (avoids setState-during-render)
  useEffect(() => {
    if (pendingNotify) {
      onCropChange(crop);
      setPendingNotify(false);
    }
  }, [pendingNotify, crop, onCropChange]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, scale: number) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      // Determine if clicking near the left or right edge of the crop for resizing
      const edgeThreshold = 10 / scale;
      const cropRight = crop.x + crop.width;

      if (
        mouseX >= crop.x - edgeThreshold &&
        mouseX <= crop.x + edgeThreshold &&
        mouseY >= crop.y &&
        mouseY <= crop.y + crop.height
      ) {
        dragMode.current = "resize-left";
      } else if (
        mouseX >= cropRight - edgeThreshold &&
        mouseX <= cropRight + edgeThreshold &&
        mouseY >= crop.y &&
        mouseY <= crop.y + crop.height
      ) {
        dragMode.current = "resize-right";
      } else {
        dragMode.current = "move";
      }

      isDragging.current = true;
      dragStart.current = { x: mouseX, y: mouseY };
      cropAtDragStart.current = { ...crop };
    },
    [crop]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, scale: number) => {
      if (!isDragging.current) return;

      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      const dx = mouseX - dragStart.current.x;
      const dy = mouseY - dragStart.current.y;

      let newCrop: CropRegion;

      if (dragMode.current === "move") {
        newCrop = {
          ...cropAtDragStart.current,
          x: cropAtDragStart.current.x + dx,
          y: cropAtDragStart.current.y + dy,
        };
      } else if (dragMode.current === "resize-left") {
        const newX = cropAtDragStart.current.x + dx;
        const newWidth = cropAtDragStart.current.width - dx;
        const newHeight = cropHeightFromWidth(newWidth);
        newCrop = { x: newX, y: cropAtDragStart.current.y, width: newWidth, height: newHeight };
      } else {
        const newWidth = cropAtDragStart.current.width + dx;
        const newHeight = cropHeightFromWidth(newWidth);
        newCrop = { ...cropAtDragStart.current, width: newWidth, height: newHeight };
      }

      const clamped = clampCrop(newCrop, sourceWidth, sourceHeight);
      setCrop(clamped);
    },
    [sourceWidth, sourceHeight]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      setCrop((currentCrop) =>
        clampCrop(currentCrop, sourceWidth, sourceHeight)
      );
      setPendingNotify(true);
    }
  }, [sourceWidth, sourceHeight]);

  const setCropDirect = useCallback(
    (newCrop: CropRegion) => {
      const clamped = clampCrop(newCrop, sourceWidth, sourceHeight);
      setCrop(clamped);
      setPendingNotify(true);
    },
    [sourceWidth, sourceHeight]
  );

  return {
    crop,
    setCrop: setCropDirect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging: isDragging.current,
  };
}
