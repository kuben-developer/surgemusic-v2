"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./custom-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as PublicToaster } from "sonner"
import { PUBLIC_ROUTE_PREFIXES, UI_CONSTANTS } from "../constants/navigation.constants"
import type { LayoutWrapperProps } from "../types/navigation.types"

function PublicLayout({ children }: LayoutWrapperProps) {
  const currentYear = new Date().getFullYear()
  const copyrightText = UI_CONSTANTS.FOOTER.COPYRIGHT_TEMPLATE.replace('{year}', currentYear.toString())
  
  return (
    <>
      <div className="relative flex min-h-screen flex-col items-center">
        <main 
          className="flex-1 w-full flex justify-center"
          role="main"
          aria-label="Main content"
        >
          <div className="w-full max-w-screen-xl">{children}</div>
        </main>
        <footer 
          className="py-6 text-center text-sm text-muted-foreground w-full"
          role="contentinfo"
        >
          {copyrightText}
        </footer>
      </div>
      <PublicToaster position="top-center" />
    </>
  )
}

function PrivateLayout({ children }: LayoutWrapperProps) {
  return (
    <>
      <div role="application" aria-label="Surge Music Dashboard">
        <Sidebar>{children}</Sidebar>
      </div>
      <Toaster />
    </>
  )
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Check if current route is a public route
  const isPublicRoute = PUBLIC_ROUTE_PREFIXES.some(prefix => 
    pathname.startsWith(prefix)
  )

  // Render appropriate layout based on route type
  if (isPublicRoute) {
    return <PublicLayout>{children}</PublicLayout>
  }

  return <PrivateLayout>{children}</PrivateLayout>
}