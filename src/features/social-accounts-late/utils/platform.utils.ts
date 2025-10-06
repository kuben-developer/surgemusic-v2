import { PLATFORM_STYLES, type PlatformName } from '../constants/platforms'

export function getPlatformBadgeClass(platform: string): string {
  const platformKey = platform.toLowerCase() as PlatformName
  return PLATFORM_STYLES[platformKey]?.badge ?? PLATFORM_STYLES.default.badge
}

export function formatPlatformName(platform: string): string {
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

export function isPlatformSupported(platform: string): boolean {
  const supportedPlatforms: readonly string[] = ['instagram', 'tiktok', 'youtube']
  return supportedPlatforms.includes(platform.toLowerCase())
}

export function getPlatformIcon(platform: string): string {
  const platformKey = platform.toLowerCase() as PlatformName
  return PLATFORM_STYLES[platformKey]?.icon ?? PLATFORM_STYLES.default.icon
}

export function getPlatformColor(platform: string): string {
  const platformKey = platform.toLowerCase() as PlatformName
  return PLATFORM_STYLES[platformKey]?.badge ?? PLATFORM_STYLES.default.badge
}
