"use client"

import Image from "next/image"
import * as React from "react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { navigationData } from "../constants/navigation.constants"
import { useLogo } from "../hooks/useLogo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { AppSidebarProps } from "../types/navigation.types"

export function AppSidebar({ className, ...props }: AppSidebarProps) {
  const { logoConfig } = useLogo()

  return (
    <Sidebar collapsible="icon" className={className} {...props}>
      <SidebarHeader className="py-4" role="banner">
        <Image
          src={logoConfig.src}
          alt={logoConfig.alt}
          width={logoConfig.width}
          height={logoConfig.height}
          className={logoConfig.className}
          priority
        />
      </SidebarHeader>
      <SidebarContent role="navigation" aria-label="Main navigation">
        <NavMain items={navigationData.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}
