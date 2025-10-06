"use client"

import { useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export function useProfileActions() {
  const createProfileAction = useAction(api.app.late.createProfile);
  const deleteProfileAction = useAction(api.app.late.deleteProfile);
  const generateConnectUrlAction = useAction(api.app.late.generateConnectUrl);
  const disconnectAccountAction = useAction(api.app.late.disconnectAccount);

  const createProfile = async (profileName: string) => {
    try {
      await createProfileAction({
        profileName,
        description: `Late profile for ${profileName}`,
        color: "#ffeda0",
      });
      toast.success(`Late profile "${profileName}" created successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create Late profile";
      toast.error(`Failed to create profile: ${errorMessage}`);
      throw error;
    }
  };

  const deleteProfile = async (profileId: Id<"lateProfiles">) => {
    try {
      await deleteProfileAction({ profileId });
      toast.success("Late profile deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete Late profile";
      toast.error(`Failed to delete profile: ${errorMessage}`);
      throw error;
    }
  };

  const openConnectUrl = async (
    profileId: Id<"lateProfiles">,
    platform: "tiktok" | "instagram" | "youtube"
  ) => {
    try {
      const result = await generateConnectUrlAction({
        profileId,
        platform,
        redirectUrl: window.location.origin + `/social-accounts-late/oauth-callback/${profileId}`,
      });

      if (result && result.url) {
        window.location.href = result.url;
      } else {
        toast.error("No connection URL received from server");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to generate connection URL: ${errorMessage}`);
    }
  };

  const disconnectAccount = async (accountId: Id<"lateSocialAccounts">) => {
    try {
      await disconnectAccountAction({ accountId });
      toast.success("Account disconnected successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to disconnect account";
      toast.error(`Failed to disconnect account: ${errorMessage}`);
      throw error;
    }
  };

  return {
    createProfile,
    deleteProfile,
    openConnectUrl,
    disconnectAccount,
  };
}
