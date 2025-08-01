import { useState } from "react";

interface Profile {
  profileKey: string;
  profileName: string;
  socialAccounts: { platform: string; _id: string }[];
}

interface UseProfileSelectionProps {
  profiles: Profile[] | undefined;
}

export function useProfileSelection({ profiles }: UseProfileSelectionProps) {
  const [profilePlatforms, setProfilePlatforms] = useState<Record<string, string[]>>({});
  const [lastSelectedProfileIndex, setLastSelectedProfileIndex] = useState<number | null>(null);

  // Toggle platform for a specific profile
  const toggleProfilePlatform = (profileId: string, platformId: string) => {
    setProfilePlatforms(prev => {
      const currentPlatforms = prev[profileId] || [];
      const newPlatforms = currentPlatforms.includes(platformId)
        ? currentPlatforms.filter(p => p !== platformId)
        : [...currentPlatforms, platformId];

      return {
        ...prev,
        [profileId]: newPlatforms
      };
    });
  };

  // Handle profile selection with shift-click support
  const handleProfileClick = (profileIndex: number, profileKey: string, platformId: string, event: React.MouseEvent) => {
    if (!profiles) return;

    const profile = profiles[profileIndex];
    const hasAccount = profile?.socialAccounts.some(
      account => account.platform.toLowerCase() === platformId
    );

    if (!hasAccount) return;

    if (event.shiftKey && lastSelectedProfileIndex !== null) {
      // Shift-click: select range of profiles
      const start = Math.min(lastSelectedProfileIndex, profileIndex);
      const end = Math.max(lastSelectedProfileIndex, profileIndex);

      setProfilePlatforms(prev => {
        const newState = { ...prev };

        for (let i = start; i <= end; i++) {
          const p = profiles[i];
          if (!p) continue;

          // Check if this profile has the platform
          const hasThisPlatform = p.socialAccounts.some(
            account => account.platform.toLowerCase() === platformId
          );

          if (hasThisPlatform) {
            const currentPlatforms = newState[p.profileKey] || [];
            if (!currentPlatforms.includes(platformId)) {
              newState[p.profileKey] = [...currentPlatforms, platformId];
            }
          }
        }

        return newState;
      });
    } else {
      // Normal click
      toggleProfilePlatform(profileKey, platformId);
    }

    setLastSelectedProfileIndex(profileIndex);
  };

  // Select all profiles for a specific platform
  const selectAllForPlatform = (platformId: string) => {
    if (!profiles) return;

    setProfilePlatforms(prev => {
      const newState = { ...prev };

      profiles.forEach(profile => {
        const hasAccount = profile.socialAccounts.some(
          account => account.platform.toLowerCase() === platformId
        );

        if (hasAccount) {
          const currentPlatforms = newState[profile.profileKey] || [];
          if (!currentPlatforms.includes(platformId)) {
            newState[profile.profileKey] = [...currentPlatforms, platformId];
          }
        }
      });

      return newState;
    });
  };

  // Unselect all profiles for a specific platform
  const unselectAllForPlatform = (platformId: string) => {
    setProfilePlatforms(prev => {
      const newState = { ...prev };

      Object.keys(newState).forEach(profileKey => {
        if (newState[profileKey]) {
          newState[profileKey] = newState[profileKey].filter(p => p !== platformId);
        }
      });

      return newState;
    });
  };

  // Get selected profiles (profiles with at least one platform selected)
  const getSelectedProfiles = () => {
    return Object.entries(profilePlatforms)
      .filter(([_, platforms]) => platforms.length > 0)
      .map(([profileId]) => profileId);
  };

  // Check if any profile has a specific platform selected
  const isAnyProfileSelectedForPlatform = (platformId: string) => {
    return Object.values(profilePlatforms).some(platforms => platforms.includes(platformId));
  };

  // Check if all profiles with a platform have it selected
  const areAllProfilesSelectedForPlatform = (platformId: string) => {
    if (!profiles) return false;

    const profilesWithPlatform = profiles.filter(profile =>
      profile.socialAccounts.some(account => account.platform.toLowerCase() === platformId)
    );

    if (profilesWithPlatform.length === 0) return false;

    return profilesWithPlatform.every(profile =>
      (profilePlatforms[profile.profileKey] || []).includes(platformId)
    );
  };

  return {
    profilePlatforms,
    lastSelectedProfileIndex,
    toggleProfilePlatform,
    handleProfileClick,
    selectAllForPlatform,
    unselectAllForPlatform,
    getSelectedProfiles,
    isAnyProfileSelectedForPlatform,
    areAllProfilesSelectedForPlatform,
  };
}