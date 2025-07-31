import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  LayoutGrid,
  Link2,
  CreditCard
} from "lucide-react"
import type { NavSection } from "../types/navigation.types"

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