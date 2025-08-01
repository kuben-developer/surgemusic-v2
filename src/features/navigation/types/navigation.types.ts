import { type LucideIcon } from "lucide-react"
import { type ComponentProps } from "react"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
}

export interface NavSection {
  section: string
  items: NavItem[]
}

export interface NavigationData {
  navMain: NavSection[]
  projects: NavItem[]
}

export interface ProjectItem {
  name: string
  url: string
  icon: LucideIcon
}

export interface TeamItem {
  name: string
  logo: React.ElementType
  plan: string
}

export interface UserData {
  id: string
  name: string
  email: string
  imageUrl?: string
}

// Component prop types
export interface NavMainProps {
  items: NavSection[]
}

export interface NavProjectsProps {
  projects: ProjectItem[]
}

export interface TeamSwitcherProps {
  teams: TeamItem[]
}

export interface LayoutWrapperProps {
  children: React.ReactNode
}

export interface AppSidebarProps extends ComponentProps<"div"> {
  className?: string
}