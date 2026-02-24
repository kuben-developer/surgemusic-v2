"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { CropRegion } from "../../shared/types/podcast-clipper.types";
import { useCropEditor } from "../hooks/useCropEditor";

interface CropCanvasProps {
  frameUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  crop: CropRegion;
  onCropChange: (crop: CropRegion) => void;
}

export function CropCanvas({
  frameUrl,
  sourceWidth,
  sourceHeight,
  crop,
  onCropChange,
}: CropCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [displayWidth, setDisplayWidth] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const scale = displayWidth > 0 ? displayWidth / sourceWidth : 1;
  const displayHeight = sourceHeight * scale;

  const {
    crop: currentCrop,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCropEditor({
    sourceWidth,
    sourceHeight,
    initialCrop: crop,
    onCropChange,
  });

  // Measure container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDisplayWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);
    setDisplayWidth(container.clientWidth);

    return () => observer.disconnect();
  }, []);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
    img.src = frameUrl;
  }, [frameUrl]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || displayWidth <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Draw the image
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

    // Dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Clear the crop area to show the image through
    const cx = currentCrop.x * scale;
    const cy = currentCrop.y * scale;
    const cw = currentCrop.width * scale;
    const ch = currentCrop.height * scale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, cy, cw, ch);
    ctx.clip();
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
    ctx.restore();

    // Green border around crop
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);

    // Dimension label
    ctx.fillStyle = "#22c55e";
    ctx.font = "12px monospace";
    const label = `${currentCrop.width}x${currentCrop.height}`;
    ctx.fillText(label, cx + 4, cy - 6);

    // Edge handles
    const handleSize = 6;
    ctx.fillStyle = "#22c55e";
    // Left edge handle
    ctx.fillRect(cx - handleSize / 2, cy + ch / 2 - handleSize / 2, handleSize, handleSize);
    // Right edge handle
    ctx.fillRect(cx + cw - handleSize / 2, cy + ch / 2 - handleSize / 2, handleSize, handleSize);
  }, [currentCrop, displayWidth, displayHeight, scale, imageLoaded]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        style={{ width: displayWidth, height: displayHeight, cursor: "crosshair" }}
        onMouseDown={(e) => handleMouseDown(e, scale)}
        onMouseMove={(e) => handleMouseMove(e, scale)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
