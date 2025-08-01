"use client"

import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { NavMainProps } from "../types/navigation.types"
import { validateNavSections } from "../utils/validation.utils"

export function NavMain({ items }: NavMainProps) {
  if (!items || items.length === 0 || !validateNavSections(items)) {
    return null
  }

  return (
    <>
      {items.map((section) => (
        <SidebarGroup key={section.section}>
          <SidebarGroupLabel>{section.section}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url} aria-label={`Navigate to ${item.title}`}>
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span 
                        className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
                        aria-label={`${item.badge} notifications`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
