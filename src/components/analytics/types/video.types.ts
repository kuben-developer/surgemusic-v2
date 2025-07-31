export interface VideoMetric {
  id: string;
  _id?: string;
  videoInfo: VideoInfo;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: string;
}

export interface VideoInfo {
  id: string;
  _id?: string;
  postId: string | null;
  videoUrl: string;
  videoName: string;
  videoType: string;
  tiktokUrl: string;
  createdAt: Date;
  _creationTime?: number;
  campaign: VideoCampaign;
}

export interface VideoCampaign {
  id: number;
  campaignName: string;
}