import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { PLATFORMS } from "../constants/platforms";

interface Profile {
  profileKey: string;
  profileName: string;
  socialAccounts: { platform: string; _id: string }[];
}

interface ProfilesStepProps {
  profiles: Profile[] | undefined;
  isLoadingProfiles: boolean;
  profilePlatforms: Record<string, string[]>;
  lastSelectedProfileIndex: number | null;
  onToggleProfilePlatform: (profileId: string, platformId: string) => void;
  onHandleProfileClick: (profileIndex: number, profileKey: string, platformId: string, event: React.MouseEvent) => void;
  onSelectAllForPlatform: (platformId: string) => void;
  onUnselectAllForPlatform: (platformId: string) => void;
  getSelectedProfiles: () => string[];
  isAnyProfileSelectedForPlatform: (platformId: string) => boolean;
  areAllProfilesSelectedForPlatform: (platformId: string) => boolean;
}

export function ProfilesStep({
  profiles,
  isLoadingProfiles,
  profilePlatforms,
  onToggleProfilePlatform,
  onHandleProfileClick,
  onSelectAllForPlatform,
  onUnselectAllForPlatform,
  getSelectedProfiles,
  isAnyProfileSelectedForPlatform,
  areAllProfilesSelectedForPlatform,
}: ProfilesStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-medium flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select profiles and platforms
          <Badge variant="secondary" className="ml-auto">
            {getSelectedProfiles().length} profiles
          </Badge>
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose which social media profiles to post to and select platforms for each. Hold Shift and click to select multiple profiles at once.
        </p>

        {/* Select/Unselect All buttons */}
        <div className="flex gap-2 p-2 bg-muted/20 rounded-lg border border-muted/30">
          {PLATFORMS.map(platform => {
            const Icon = platform.icon;
            const isAllSelected = areAllProfilesSelectedForPlatform(platform.id);
            const isAnySelected = isAnyProfileSelectedForPlatform(platform.id);

            return (
              <Button
                key={platform.id}
                variant={isAllSelected ? "default" : isAnySelected ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-2"
                onClick={() => {
                  if (isAllSelected) {
                    onUnselectAllForPlatform(platform.id);
                  } else {
                    onSelectAllForPlatform(platform.id);
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">
                  {isAllSelected ? "Unselect" : "Select"} all {platform.label}
                </span>
              </Button>
            );
          })}
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
          {isLoadingProfiles ? (
            <div className="text-center py-4">Loading profiles...</div>
          ) : profiles?.map((profile, profileIndex) => (
            <div
              key={profile.profileKey}
              className="rounded-lg border border-primary/10 bg-muted/5 p-3 hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {profile.profileName.split("|")[0]?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{profile.profileName.split("|")[0]}</div>
                    <div className="text-xs text-muted-foreground">
                      {profile.socialAccounts.length} connected accounts
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {PLATFORMS.map(platform => {
                    const hasAccount = profile.socialAccounts.some(
                      account => account.platform.toLowerCase() === platform.id
                    );
                    const isSelected = (profilePlatforms[profile.profileKey] || []).includes(platform.id);
                    const Icon = platform.icon;
                    return (
                      <div key={platform.id} className="relative">
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-8 px-2 flex items-center gap-1.5 min-w-[80px] relative",
                            !hasAccount && "bg-muted/90 border-dashed opacity-50",
                            !isSelected && hasAccount && "opacity-70"
                          )}
                          onClick={(e) => onHandleProfileClick(profileIndex, profile.profileKey, platform.id, e)}
                          disabled={!hasAccount}
                          title={!hasAccount ? `No ${platform.id} account connected` : `Post to ${platform.id} (Hold Shift to select multiple)`}
                        >
                          <Icon className={cn("h-4 w-4", !hasAccount && "opacity-50")} />
                          <span className={cn("text-xs capitalize", !hasAccount && "opacity-50")}>
                            {platform.id}
                          </span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}