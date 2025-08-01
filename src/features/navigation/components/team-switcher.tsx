"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { TeamSwitcherProps, TeamItem } from "../types/navigation.types"
import { validateTeams } from "../utils/validation.utils"

interface TeamSwitcherHandlers {
  onTeamChange?: (team: TeamItem) => void
  onAddTeam?: () => void
}

export function TeamSwitcher({
  teams,
  onTeamChange,
  onAddTeam,
}: TeamSwitcherProps & TeamSwitcherHandlers) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState<TeamItem | null>(
    teams?.[0] || null
  )
  
  // Handle team change with callback
  const handleTeamChange = React.useCallback((team: TeamItem) => {
    setActiveTeam(team)
    onTeamChange?.(team)
  }, [onTeamChange])

  // Don't render if no teams available or invalid data
  if (!teams || teams.length === 0 || !validateTeams(teams) || !activeTeam) {
    return null
  }

  const ActiveLogo = activeTeam.logo

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label={`Current team: ${activeTeam.name}`}
            >
              <div 
                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                aria-hidden="true"
              >
                <ActiveLogo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeTeam.plan}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" aria-hidden="true" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
            aria-label="Team selection menu"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => {
              const TeamLogo = team.logo
              const isActive = activeTeam.name === team.name
              
              return (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => handleTeamChange(team)}
                  className="gap-2 p-2"
                  aria-label={`Switch to ${team.name} team`}
                  data-active={isActive}
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <TeamLogo className="size-4 shrink-0" />
                  </div>
                  <span className={isActive ? "font-medium" : ""}>
                    {team.name}
                  </span>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 p-2"
              onClick={onAddTeam}
              aria-label="Add new team"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
