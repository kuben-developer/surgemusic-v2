"use client"

import { Users } from "lucide-react"

interface ProfileStatsProps {
  profileCount: number
  title?: string
  subtitle?: string
}

export function ProfileStats({ 
  profileCount, 
  title = "Total Profiles",
  subtitle 
}: ProfileStatsProps) {
  return (
    <div className="mb-6 rounded-lg bg-muted/30 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{profileCount}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}