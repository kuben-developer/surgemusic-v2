"use client"

import { Button } from "@/components/ui/button"
import { Link, Trash2 } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"

interface ProfileActionsProps {
  profileId: Id<"lateProfiles">
  profileName: string
  onDelete: (profileId: Id<"lateProfiles">) => void
  onConnect: (profileId: Id<"lateProfiles">) => void
}

export function ProfileActions({
  profileId,
  profileName,
  onDelete,
  onConnect
}: ProfileActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="gap-0.5 h-6 text-[11px] px-2 py-0"
        onClick={() => onConnect(profileId)}
      >
        <Link className="h-3 w-3" />
        Connect Accounts
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-0.5 h-6 text-[11px] px-2 py-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        onClick={() => onDelete(profileId)}
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </Button>
    </div>
  )
}
