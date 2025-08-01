"use client"

import { Badge } from "@/components/ui/badge"
import type { ProfileWithAccounts } from '../types/social-accounts.types'

interface ProfileHeaderProps {
  profile: ProfileWithAccounts
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const profileDisplayName = profile.profileName.split("|")[0]
  
  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-lg">{profileDisplayName}</h3>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="secondary" className="text-xs">
          {profile.socialAccounts.length} connected
        </Badge>
        <span className="text-xs">
          Created {new Date(profile._creationTime).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}