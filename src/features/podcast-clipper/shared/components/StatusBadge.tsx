"use client";

import { Badge } from "@/components/ui/badge";
import {
  CALIBRATION_STATUS_LABELS,
  VIDEO_STATUS_LABELS,
} from "../constants/podcast-clipper.constants";

interface CalibrationStatusBadgeProps {
  status: string;
}

export function CalibrationStatusBadge({ status }: CalibrationStatusBadgeProps) {
  const label = CALIBRATION_STATUS_LABELS[status] ?? status;

  const variant =
    status === "configured"
      ? "default"
      : status === "detected"
        ? "secondary"
        : status === "pending"
          ? "outline"
          : "destructive";

  return <Badge variant={variant}>{label}</Badge>;
}

interface VideoStatusBadgeProps {
  status: string;
}

export function VideoStatusBadge({ status }: VideoStatusBadgeProps) {
  const label = VIDEO_STATUS_LABELS[status] ?? status;

  const variant =
    status === "reframed"
      ? "default"
      : status === "reframing"
        ? "outline"
        : status === "failed"
          ? "destructive"
          : "secondary";

  return <Badge variant={variant}>{label}</Badge>;
}
