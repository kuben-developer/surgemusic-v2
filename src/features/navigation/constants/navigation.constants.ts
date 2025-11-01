import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  LayoutGrid,
  Link2,
  CreditCard,
  Scissors
} from "lucide-react"
import type { NavSection } from "../types/navigation.types"

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR: {
    HEADER_HEIGHT: 'h-16',
    COLLAPSED_HEIGHT: 'h-12',
    LOGO_SIZE: {
      FULL: { width: 120, height: 40 },
      ICON: { width: 40, height: 40, className: "max-h-10 max-w-10 h-8 w-8" }
    }
  },
  FOOTER: {
    COPYRIGHT_TEMPLATE: "© {year} Surge Music. All rights reserved."
  },
  AVATAR: {
    SIZE: "h-8 w-8",
    FALLBACK_INITIALS_LENGTH: 2
  }
} as const

// Logo paths based on theme
export const LOGO_PATHS = {
  LIGHT: {
    FULL: "/surge_black.png",
    ICON: "/surge_icon_black.png"
  },
  DARK: {
    FULL: "/surge_white.png", 
    ICON: "/surge_icon_white.png"
  }
} as const

// Public routes that don't require sidebar
export const PUBLIC_ROUTE_PREFIXES = ['/public', '/sign-up', '/sign-in'] as const

// Navigation data structure
export const navigationData: { navMain: NavSection[] } = {
  navMain: [
    {
      section: "Create",
      items: [
        {
          title: "Home",
          url: "/",
          icon: Home,
        },
        {
          title: "My Campaigns",
          url: "/campaign",
          icon: LayoutGrid,
        },
        {
          title: "Clipper & Montager",
          url: "/clipper",
          icon: Scissors,
        },
        {
          title: "Pricing",
          url: "/pricing",
          icon: CreditCard,
        },
      ],
    },
    {
      section: "Manage",
      items: [
        {
          title: "Social Accounts",
          url: "/social-accounts",
          icon: Link2,
        },
        {
          title: "Social Accounts (Late)",
          url: "/social-accounts-late",
          icon: Link2,
        },
        {
          title: "Reports",
          url: "/reports",
          icon: FileText,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: BarChart3,
        },
      ],
    },
  ],
}