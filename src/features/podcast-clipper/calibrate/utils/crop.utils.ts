import type { CropRegion } from "../../shared/types/podcast-clipper.types";

/** Round a number to the nearest even integer (h264 macroblock requirement) */
export function roundEven(n: number): number {
  return Math.round(n / 2) * 2;
}

/** Round down to the nearest even integer */
function floorEven(n: number): number {
  return Math.floor(n / 2) * 2;
}

/** Calculate the maximum crop width for a 9:16 aspect ratio within source dimensions.
 *  Uses floor rounding so the derived height never exceeds sourceHeight. */
export function maxCropWidth(sourceHeight: number): number {
  return floorEven(sourceHeight * (9 / 16));
}

/** Calculate crop height from width at 9:16 ratio */
export function cropHeightFromWidth(width: number): number {
  return roundEven(width * (16 / 9));
}

/** Clamp a crop region to fit within source bounds, keeping dimensions even */
export function clampCrop(
  crop: CropRegion,
  sourceWidth: number,
  sourceHeight: number
): CropRegion {
  let { x, y } = crop;
  let width = crop.width;

  width = Math.min(width, maxCropWidth(sourceHeight));
  width = Math.max(width, 2);
  width = roundEven(width);
  let height = cropHeightFromWidth(width);

  // Safety: if rounding pushed height past source, reduce width by 2
  while (height > sourceHeight && width > 2) {
    width -= 2;
    height = cropHeightFromWidth(width);
  }

  // Clamp position
  x = Math.max(0, Math.min(x, sourceWidth - width));
  y = Math.max(0, Math.min(y, sourceHeight - height));

  return {
    x: roundEven(x),
    y: roundEven(y),
    width,
    height,
  };
}

/** Create a centered default crop for a 9:16 region within source dimensions */
export function defaultCrop(sourceWidth: number, sourceHeight: number): CropRegion {
  const width = maxCropWidth(sourceHeight);
  const height = cropHeightFromWidth(width);
  const x = roundEven((sourceWidth - width) / 2);
  const y = roundEven((sourceHeight - height) / 2);

  return { x, y, width, height };
}

/** Convert source coordinates to display coordinates */
export function toDisplayCoords(
  crop: CropRegion,
  scale: number
): CropRegion {
  return {
    x: crop.x * scale,
    y: crop.y * scale,
    width: crop.width * scale,
    height: crop.height * scale,
  };
}

/** Convert display coordinates to source coordinates */
export function toSourceCoords(
  crop: CropRegion,
  scale: number
): CropRegion {
  return clampCropToEven({
    x: crop.x / scale,
    y: crop.y / scale,
    width: crop.width / scale,
    height: crop.height / scale,
  });
}

function clampCropToEven(crop: CropRegion): CropRegion {
  return {
    x: roundEven(crop.x),
    y: roundEven(crop.y),
    width: roundEven(crop.width),
    height: roundEven(crop.height),
  };
}
