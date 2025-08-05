"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProfileHeader } from './ProfileHeader'
import { ProfileActions } from './ProfileActions'
import { ProfileContent } from './ProfileContent'
import type { ProfileWithAccounts } from '../types/social-accounts.types'

interface ProfileCardProps {
  profile: ProfileWithAccounts
  isExpanded: boolean
  onToggleExpand: (profileName: string) => void
  onDelete: (profileName: string) => void
  onOpenManager: (profileKey: string) => void
  isGeneratingUrl?: boolean
}

export function ProfileCard({
  profile,
  isExpanded,
  onToggleExpand,
  onDelete,
  onOpenManager,
  isGeneratingUrl = false
}: ProfileCardProps) {
  return (
    <Card className="overflow-hidden space-y-0 px-2 py-1 gap-0">
      <CardHeader className="px-2 py-0 pt-2 ">
        <div className="flex items-center justify-between">
          <ProfileHeader
            profile={profile}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
          />
          <ProfileActions
            profileName={profile.profileName}
            profileKey={profile.profileKey ?? ''}
            isGeneratingUrl={isGeneratingUrl}
            onDelete={onDelete}
            onOpenManager={onOpenManager}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="py-2">
          <ProfileContent
            profile={profile}
            onOpenManager={onOpenManager}
          />
        </CardContent>
      )}
    </Card>
  )
}