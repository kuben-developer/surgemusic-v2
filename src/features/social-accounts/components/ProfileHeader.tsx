"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ProfileWithAccounts } from '../types/social-accounts.types'

interface ProfileHeaderProps {
  profile: ProfileWithAccounts
  isExpanded: boolean
  onToggleExpand: (profileName: string) => void
}

export function ProfileHeader({ profile, isExpanded, onToggleExpand }: ProfileHeaderProps) {
  const profileDisplayName = profile.profileName.split("|")[0]
  const accountCount = profile.socialAccounts.length
  
  return (
    <div className="flex items-center gap-1.5 flex-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0"
        onClick={() => onToggleExpand(profile.profileName)}
      >
        {isExpanded ?
          <ChevronUp className="h-3.5 w-3.5" /> :
          <ChevronDown className="h-3.5 w-3.5" />}
      </Button>

      <div className="flex items-center gap-1.5">
        <h3 className="font-medium text-sm">{profileDisplayName}</h3>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
          {accountCount} {accountCount === 1 ? 'account' : 'accounts'}
        </Badge>
      </div>
    </div>
  )
}