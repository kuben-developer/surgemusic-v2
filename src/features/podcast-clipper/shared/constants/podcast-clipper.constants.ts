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
  downloading: "Downloading...",
  uploaded: "Uploaded",
  failed: "Failed",
};

export const CLIP_STATUS_LABELS: Record<string, string> = {
  approved: "Approved",
  cutting: "Cutting...",
  cut: "Cut",
  reframing: "Reframing...",
  reframed: "Reframed",
  rendering_overlay: "Rendering...",
  completed: "Completed",
  failed: "Failed",
};
