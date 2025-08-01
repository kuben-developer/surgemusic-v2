import { type LucideIcon } from "lucide-react"

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