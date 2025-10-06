"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProfileHeader } from './ProfileHeader'
import { ProfileActions } from './ProfileActions'
import { ProfileContent } from './ProfileContent'
import type { LateProfileWithAccounts } from '../types/social-accounts.types'
import type { Id } from "../../../../convex/_generated/dataModel"

interface ProfileCardProps {
  profile: LateProfileWithAccounts
  isExpanded: boolean
  onToggleExpand: (profileName: string) => void
  onDelete: (profileId: Id<"lateProfiles">) => void
  onConnect: (profileId: Id<"lateProfiles">) => void
  onDisconnect: (accountId: Id<"lateSocialAccounts">) => void
}

export function ProfileCard({
  profile,
  isExpanded,
  onToggleExpand,
  onDelete,
  onConnect,
  onDisconnect
}: ProfileCardProps) {
  return (
    <Card className="overflow-hidden space-y-0 px-2 py-1 gap-0">
      <CardHeader className="px-2 py-0 pt-2">
        <div className="flex items-center justify-between">
          <ProfileHeader
            profile={profile}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
          />
          <ProfileActions
            profileId={profile._id}
            profileName={profile.profileName}
            onDelete={onDelete}
            onConnect={onConnect}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2 pb-2.5">
          <ProfileContent
            profile={profile}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </CardContent>
      )}
    </Card>
  )
}
