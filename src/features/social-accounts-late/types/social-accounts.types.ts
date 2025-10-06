import type { Id } from "../../../../convex/_generated/dataModel";

export interface LateSocialAccount {
  _id: Id<"lateSocialAccounts">;
  lateProfileId: Id<"lateProfiles">;
  platform: "tiktok" | "instagram" | "youtube";
  lateAccountId: string;
  profileUrl: string;
  userImage: string;
  username: string;
  displayName?: string;
}

export interface LateProfileWithAccounts {
  _id: Id<"lateProfiles">;
  profileName: string;
  lateProfileId: string;
  userId: Id<"users">;
  _creationTime: number;
  socialAccounts: LateSocialAccount[];
}
