"use client"

import { useTheme } from "next-themes"
import { useSidebar } from "@/components/ui/sidebar"
import { LOGO_PATHS, UI_CONSTANTS } from "../constants/navigation.constants"

interface LogoConfig {
  src: string
  iconSrc: string
  alt: string
  width: number
  height: number
  className?: string
}

interface UseLogoReturn {
  logoSrc: string
  logoIconSrc: string
  logoConfig: LogoConfig
  isCollapsed: boolean
}

export function useLogo(): UseLogoReturn {
  const { resolvedTheme } = useTheme()
  const { state } = useSidebar()
  
  const isDark = resolvedTheme === "dark"
  const isCollapsed = state === "collapsed"
  
  const logoSrc = isDark ? LOGO_PATHS.DARK.FULL : LOGO_PATHS.LIGHT.FULL
  const logoIconSrc = isDark ? LOGO_PATHS.DARK.ICON : LOGO_PATHS.LIGHT.ICON
  
  const logoConfig: LogoConfig = {
    src: isCollapsed ? logoIconSrc : logoSrc,
    iconSrc: logoIconSrc,
    alt: "Surge Logo",
    width: isCollapsed 
      ? UI_CONSTANTS.SIDEBAR.LOGO_SIZE.ICON.width 
      : UI_CONSTANTS.SIDEBAR.LOGO_SIZE.FULL.width,
    height: isCollapsed 
      ? UI_CONSTANTS.SIDEBAR.LOGO_SIZE.ICON.height 
      : UI_CONSTANTS.SIDEBAR.LOGO_SIZE.FULL.height,
    className: isCollapsed ? UI_CONSTANTS.SIDEBAR.LOGO_SIZE.ICON.className : undefined,
  }
  
  return {
    logoSrc,
    logoIconSrc,
    logoConfig,
    isCollapsed,
  }
}