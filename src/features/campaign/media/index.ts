// Main component
export { CampaignMediaSection } from "./components/CampaignMediaSection";

// Sub-components (optional exports)
export { AudioUploadSection } from "./components/AudioUploadSection";
export { LyricsSection } from "./components/LyricsSection";
export { CaptionsSection } from "./components/CaptionsSection";

// Hooks
export { useCampaignAudio } from "./hooks/useCampaignAudio";
export { useCampaignLyrics } from "./hooks/useCampaignLyrics";
export { useCampaignCaptions } from "./hooks/useCampaignCaptions";

// Types
export type { CampaignMediaData, Caption } from "./types/media.types";
