import { FileText, Layers, Music } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const RENDER_TYPES = ["Both", "LyricsOnly", "CaptionOnly"] as const;

export type RenderType = (typeof RENDER_TYPES)[number];

export interface RenderTypeOption {
  value: RenderType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const RENDER_TYPE_OPTIONS: RenderTypeOption[] = [
  {
    value: "Both",
    label: "Both",
    description: "Include both lyrics and captions in the render",
    icon: Layers,
    color: "text-green-500",
  },
  {
    value: "LyricsOnly",
    label: "Lyrics Only",
    description: "Render only the lyrics from the SRT file",
    icon: Music,
    color: "text-blue-500",
  },
  {
    value: "CaptionOnly",
    label: "Caption Only",
    description: "Render only the text captions without lyrics",
    icon: FileText,
    color: "text-purple-500",
  },
];
