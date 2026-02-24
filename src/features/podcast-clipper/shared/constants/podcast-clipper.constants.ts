export const DEFAULT_SCENE_THRESHOLD = 27.0;
export const DEFAULT_CLUSTER_THRESHOLD = 0.7;

export const PORTRAIT_ASPECT_RATIO = 9 / 16;

export const CALIBRATION_STATUS_LABELS: Record<string, string> = {
  none: "Not Calibrated",
  pending: "Calibrating...",
  detected: "Scenes Detected",
  configured: "Ready to Reframe",
};

export const VIDEO_STATUS_LABELS: Record<string, string> = {
  uploaded: "Uploaded",
  reframing: "Reframing...",
  reframed: "Reframed",
  failed: "Failed",
};
