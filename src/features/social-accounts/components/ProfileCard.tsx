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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <ProfileHeader profile={profile} />
          <ProfileActions
            profileName={profile.profileName}
            profileKey={profile.profileKey ?? ''}
            isExpanded={isExpanded}
            isGeneratingUrl={isGeneratingUrl}
            onToggleExpand={onToggleExpand}
            onDelete={onDelete}
            onOpenManager={onOpenManager}
          />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <ProfileContent 
            profile={profile} 
            onOpenManager={onOpenManager} 
          />
        </CardContent>
      )}
    </Card>
  )
}