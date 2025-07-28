"use client"

import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  LayoutGrid,
  Link2,
  CreditCard
} from "lucide-react"
import Image from "next/image"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"

// Sample data
const data = {
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
    // {
    //   section: "Post",
    //   items: [
    //     {
    //       title: "Calendar",
    //       url: "#",
    //       icon: Calendar,
    //       badge: "New",
    //     },
    //     {
    //       title: "Analytics",
    //       url: "#",
    //       icon: BarChart3,
    //     },
    //     {
    //       title: "Social accounts",
    //       url: "#",
    //       icon: Link2,
    //     },
    //   ],
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { resolvedTheme } = useTheme()
  const { state } = useSidebar()
  const logoSrc = resolvedTheme === "dark" ? "/surge_white.png" : "/surge_black.png"
  const logoIconSrc = resolvedTheme === "dark" ? "/surge_icon_white.png" : "/surge_icon_black.png"
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        {isCollapsed ? (
          <Image
            src={logoIconSrc}
            alt="Surge Logo"
            width={120}
            color="black"
            height={40}
            className="max-h-10 max-w-10 h-8 w-8"
            priority
          />
        ) : (
          <Image
            src={logoSrc}
            alt="Surge Logo"
            width={120}
            height={40}
            priority
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}
