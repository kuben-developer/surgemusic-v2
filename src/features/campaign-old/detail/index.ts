// Page export for app router
export { default as CampaignDetailPage } from './CampaignDetailPage';

// Components
export { default as CampaignClient } from './components/CampaignClient';
export { CampaignHeader } from './components/CampaignHeader';
export { ProgressSection } from './components/ProgressSection';
export { VideoSection } from './components/VideoSection';

// Hooks
export { useCampaignDetail } from './hooks/useCampaignData';
export { useCampaignProgress } from './hooks/useCampaignProgress';
export { useVideoDownload } from './hooks/useVideoDownload';

// Types
export type { CampaignHeaderProps, VideoSectionProps, ProgressSectionProps } from './types/campaign-detail.types';