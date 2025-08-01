"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Trash2 } from "lucide-react"

interface ProfileActionsProps {
  profileName: string
  profileKey: string
  isExpanded: boolean
  isGeneratingUrl?: boolean
  onToggleExpand: (profileName: string) => void
  onDelete: (profileName: string) => void
  onOpenManager: (profileKey: string) => void
}

export function ProfileActions({ 
  profileName,
  profileKey,
  isExpanded,
  isGeneratingUrl = false,
  onToggleExpand,
  onDelete,
  onOpenManager
}: ProfileActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1 h-7 text-xs"
        onClick={() => onOpenManager(profileKey)}
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
        onClick={() => onToggleExpand(profileName)}
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
        onClick={() => onDelete(profileName)}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}