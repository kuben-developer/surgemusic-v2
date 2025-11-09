"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
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
      <AuthLoading>
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Authenticating...</p>
          </div>
        </div>
      </AuthLoading>

      <Authenticated>
        <div role="application" aria-label="Surge Music Dashboard">
          <Sidebar>{children}</Sidebar>
        </div>
        <Toaster />
      </Authenticated>

      <Unauthenticated>
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to continue</p>
            <a
              href="/sign-in"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </Unauthenticated>
    </>
  )
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const { userId } = useAuth()

  // Check if current route is a public route
  const isPublicRoute = PUBLIC_ROUTE_PREFIXES.some(prefix =>
    pathname.startsWith(prefix)
  )

  // Check if current route is an analytics route
  const isAnalyticsRoute = /\/campaign(-v2)?\/[^/]+\/analytics/.test(pathname)

  // Render public layout for:
  // 1. Explicitly public routes (sign-in, sign-up, /public/*)
  // 2. Analytics routes accessed by non-authenticated users
  if (isPublicRoute || (isAnalyticsRoute && !userId)) {
    return <PublicLayout>{children}</PublicLayout>
  }

  return <PrivateLayout>{children}</PrivateLayout>
}
