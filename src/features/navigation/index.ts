// Main navigation export for app layout
export { default as LayoutWrapper } from "./components/layout-wrapper"

// Navigation components - available for internal use
export { AppSidebar } from "./components/app-sidebar"
export { NavUser } from "./components/nav-user" 
export { NavMain } from "./components/nav-main"
export { NavProjects } from "./components/nav-projects"
export { TeamSwitcher } from "./components/team-switcher"

// Custom hooks
export { useLogo } from "./hooks/useLogo"

// Utilities
export {
  validateNavSections,
  validateProjects,
  validateTeams,
  getSafeUserName,
  getSafeUserEmail,
  generateUserInitials
} from "./utils/validation.utils"

// Constants
export { 
  navigationData,
  UI_CONSTANTS,
  LOGO_PATHS,
  PUBLIC_ROUTE_PREFIXES 
} from "./constants/navigation.constants"

// Types
export type { 
  NavigationData,
  NavItem,
  NavSection,
  ProjectItem,
  TeamItem,
  UserData,
  NavMainProps,
  NavProjectsProps,
  TeamSwitcherProps,
  LayoutWrapperProps,
  AppSidebarProps
} from "./types/navigation.types"