export type VideoCountOption = 30 | 90 | 180 | 360 | 900 | 1200;

export interface VideoOption {
  count: VideoCountOption;
  required: number;
}

export const VIDEO_OPTIONS: VideoOption[] = [
  { count: 30, required: 30 },
  { count: 90, required: 90 },
  { count: 180, required: 180 },
  { count: 360, required: 360 },
  { count: 900, required: 900 },
  { count: 1200, required: 1200 }
];

export const COMING_SOON_OPTIONS: number[] = [];

export const CUSTOM_VIDEO_CONFIG = {
  MIN_COUNT: 30,
  MAX_COUNT: 3000,
  STEP: 30,
} as const;