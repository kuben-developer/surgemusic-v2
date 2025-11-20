import { Layers, Zap, Music, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const OVERLAY_STYLES = ["Blend", "Brat", "Tiktok", "Pink"] as const;

export type OverlayStyle = (typeof OVERLAY_STYLES)[number];

export interface OverlayStyleOption {
  value: OverlayStyle;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string; // Tailwind color class for theming
}

export const OVERLAY_STYLE_OPTIONS: OverlayStyleOption[] = [
  {
    value: "Blend",
    label: "Blend",
    description: "Smooth blending overlay with natural transitions",
    icon: Layers,
    color: "text-blue-500",
  },
  {
    value: "Brat",
    label: "Brat",
    description: "Bold and energetic style with dynamic effects",
    icon: Zap,
    color: "text-purple-500",
  },
  {
    value: "Tiktok",
    label: "TikTok",
    description: "TikTok-optimized style with trending aesthetics",
    icon: Music,
    color: "text-cyan-500",
  },
  {
    value: "Pink",
    label: "Pink",
    description: "Soft pink overlay with aesthetic vibes",
    icon: Heart,
    color: "text-pink-500",
  },
];
