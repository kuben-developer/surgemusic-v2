export interface VideoCountProps {
  selectedVideoCount: number | null;
  setSelectedVideoCount: (count: number | null) => void;
  videoCountError: boolean;
  totalCredits: number;
  isSubscribed: boolean;
}