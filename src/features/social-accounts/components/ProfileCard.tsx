"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Trash2 } from "lucide-react"
import { SocialAccountCard } from './SocialAccountCard'
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
  const profileDisplayName = profile.profileName.split("|")[0]
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 h-7 text-xs"
              onClick={() => onOpenManager(profile.profileKey ?? '')}
              disabled={isGeneratingUrl}
            >
              {isGeneratingUrl ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )}
              Link / Unlink Accounts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(profile.profileName)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(profile.profileName)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {profile.socialAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No social accounts connected yet.</p>
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => onOpenManager(profile.profileKey ?? '')}
              >
                Connect an account
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.socialAccounts.map((account) => (
                <SocialAccountCard key={account._id} account={account} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}