import { PLATFORM_STYLES, PLATFORM_NAMES, type PlatformName } from '../constants/platforms'

export function getPlatformBadgeClass(platform: string): string {
  const platformKey = platform.toLowerCase() as PlatformName
  return PLATFORM_STYLES[platformKey]?.badge ?? PLATFORM_STYLES.default.badge
}

export function formatPlatformName(platform: string): string {
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

export function isPlatformSupported(platform: string): boolean {
  return PLATFORM_NAMES.includes(platform.toLowerCase() as PlatformName)
}

export function getPlatformIcon(platform: string): string {
  const platformKey = platform.toLowerCase() as PlatformName
  return PLATFORM_STYLES[platformKey]?.icon ?? PLATFORM_STYLES.default.icon
}

export function getPlatformColor(platform: string): string {
  const platformKey = platform.toLowerCase() as PlatformName
  return PLATFORM_STYLES[platformKey]?.badge ?? PLATFORM_STYLES.default.badge
}