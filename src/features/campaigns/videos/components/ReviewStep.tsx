import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Share2, Clock3, Calendar as CalendarIcon, CalendarCheck, Clock, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { TIME_SLOTS, PLATFORMS } from "../constants/platforms";

interface Profile {
  profileKey: string;
  profileName: string;
  socialAccounts: { platform: string; _id: string }[];
}

interface ReviewStepProps {
  selectedVideosCount: number;
  selectedTimeSlots: string[];
  startDate: Date;
  endDate: Date;
  profiles: Profile[] | undefined;
  profilePlatforms: Record<string, string[]>;
  getSelectedProfiles: () => string[];
}

export function ReviewStep({
  selectedVideosCount,
  selectedTimeSlots,
  startDate,
  endDate,
  profiles,
  profilePlatforms,
  getSelectedProfiles,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-medium flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Schedule Summary
        </h3>
        <div className="rounded-lg border border-primary/10 bg-muted/10 p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Videos to schedule:
              </span>
              <span className="font-medium">{selectedVideosCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Posts per day:
              </span>
              <span className="font-medium">{selectedTimeSlots.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Start date:
              </span>
              <span className="font-medium">{format(startDate, "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                End date (estimated):
              </span>
              <span className="font-medium">{format(endDate, "MMMM d, yyyy")}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-primary/10">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Posting Times
            </h4>
            <div className="flex flex-wrap gap-1">
              {selectedTimeSlots.map((slotId) => (
                <Badge key={slotId} variant="outline" className="bg-muted/30 border-primary/10 flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {TIME_SLOTS.find(slot => slot.id === slotId)?.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-primary/10">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Selected Profiles
            </h4>
            <div className="space-y-2">
              {getSelectedProfiles().map(profileKey => {
                const profile = profiles?.find(p => p.profileKey === profileKey);
                const platforms = profilePlatforms[profileKey] || [];

                return profile ? (
                  <div key={profileKey} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {profile.profileName.split("|")[0]?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{profile.profileName.split("|")[0] || ""}</span>
                        <div className="text-xs text-muted-foreground">{profile.socialAccounts.length} connected accounts</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {platforms.map((platform: string) => {
                        const Icon = PLATFORMS.find(p => p.id === platform)?.icon;
                        return (
                          <Badge key={platform} variant="outline" className="bg-muted/30 border-primary/10">
                            {Icon && <Icon className="h-3 w-3 mr-1" />}
                            {platform}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedTimeSlots.length < 3 && (
        <div className="flex items-center gap-2 text-sm text-amber-500 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span>Tip: Adding more posting times could help complete your schedule faster</span>
        </div>
      )}
    </div>
  );
}