"use client"

import Image from "next/image"
import * as React from "react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { navigationData } from "../constants/navigation.constants"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"


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
        <NavMain items={navigationData.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}
