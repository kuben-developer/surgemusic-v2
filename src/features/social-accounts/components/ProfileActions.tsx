"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2, Trash2 } from "lucide-react"

interface ProfileActionsProps {
  profileName: string
  profileKey: string
  isGeneratingUrl?: boolean
  onDelete: (profileName: string) => void
  onOpenManager: (profileKey: string) => void
}

export function ProfileActions({ 
  profileName,
  profileKey,
  isGeneratingUrl = false,
  onDelete,
  onOpenManager
}: ProfileActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="gap-0.5 h-6 text-[11px] px-2 py-0"
        onClick={() => onOpenManager(profileKey)}
        disabled={isGeneratingUrl}
      >
        {isGeneratingUrl ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ExternalLink className="h-3 w-3" />
        )}
        Link / Unlink Accounts
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-0.5 h-6 text-[11px] px-2 py-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        onClick={() => onDelete(profileName)}
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </Button>
    </div>
  )
}