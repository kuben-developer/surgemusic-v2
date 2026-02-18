"use client"

import { AppSidebar } from "./app-sidebar"
import { CreditsDisplay } from "@/features/credits"
import { ThemeSwitcher } from "@/components/common/theme-switcher"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import type { LayoutWrapperProps } from "../types/navigation.types"

type CustomSidebarProps = LayoutWrapperProps

function SidebarHeader() {
  return (
    <header
      className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      role="banner"
    >
      <div className="flex items-center gap-2 px-4 w-full justify-between">
        <SidebarTrigger
          className="-ml-1"
          aria-label="Toggle sidebar"
        />
        <div
          className="flex items-center space-x-1 gap-2"
          role="toolbar"
          aria-label="User controls"
        >
          {/* <CreditsDisplay /> */}
          <ThemeSwitcher />
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default function Sidebar({
  children
}: CustomSidebarProps) {
  return (
    <SidebarProvider>
      <AppSidebar className="w-56" />
      <SidebarInset>
        <SidebarHeader />
        <main
          className="flex flex-1 flex-col gap-4 p-4 pt-0"
          role="main"
          aria-label="Main application content"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
