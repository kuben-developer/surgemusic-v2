"use client"

import Link from "next/link"
import {
  Folder,
  Forward,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { NavProjectsProps } from "../types/navigation.types"
import { validateProjects } from "../utils/validation.utils"

interface ProjectActionHandlers {
  onView?: (projectName: string) => void
  onShare?: (projectName: string) => void
  onDelete?: (projectName: string) => void
  onAddProject?: () => void
}

export function NavProjects({ 
  projects, 
  onView, 
  onShare, 
  onDelete, 
  onAddProject 
}: NavProjectsProps & ProjectActionHandlers) {
  const { isMobile } = useSidebar()

  // Don't render if no projects to show or invalid data
  if (!projects || projects.length === 0 || !validateProjects(projects)) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={onAddProject}
              className="text-sidebar-foreground/70"
              aria-label="Create new project"
            >
              <Plus className="text-sidebar-foreground/70" />
              <span>Create Project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.name}>
            <SidebarMenuButton asChild>
              <Link href={project.url} aria-label={`Navigate to ${project.name} project`}>
                <project.icon aria-hidden="true" />
                <span>{project.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover aria-label={`More actions for ${project.name}`}>
                  <MoreHorizontal />
                  <span className="sr-only">More options for {project.name}</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => onView?.(project.name)}>
                  <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(project.name)}>
                  <Forward className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(project.name)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={onAddProject}
            className="text-sidebar-foreground/70"
            aria-label="Create new project"
          >
            <Plus className="text-sidebar-foreground/70" />
            <span>Add Project</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
