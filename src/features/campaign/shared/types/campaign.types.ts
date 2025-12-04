export interface AirtableCampaign {
  id: string;
  campaign_id: string;
  artist: string;
  song: string;
  status: string;
}

export interface AirtableContent {
  id: string;
  video_url?: string;
  account_niche: string;
  video_category: string;
  api_post_id?: string;
  date?: string; // ISO format "YYYY-MM-DD"
}

export interface VideoCategoryStats {
  category: string;
  totalCount: number;
  withUrlCount: number;
}

export interface NicheStats {
  niche: string;
  totalCount: number;
  withUrlCount: number;
}

export interface CampaignContentData {
  content: AirtableContent[];
  campaign_id: string;
  campaign_name: string;
  artist: string;
  song: string;
}

export interface MontagerVideo {
  key: string;
  url: string;
  filename: string;
  size: number;
  lastModified: number;
}

export interface MontagerFolder {
  _id: string;
  folderName: string;
  videoCount: number;
  configCount: number;
  pendingConfigs: number;
}
