export const SUPPORTED_PLATFORMS = ['TikTok', 'Instagram', 'YouTube'] as const

export const PLATFORMS = SUPPORTED_PLATFORMS

export type SupportedPlatform = typeof SUPPORTED_PLATFORMS[number]

export const PLATFORM_STYLES = {
  instagram: {
    badge: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    icon: "text-pink-500"
  },
  tiktok: {
    badge: "bg-black text-white dark:bg-white dark:text-black",
    icon: "text-black dark:text-white"
  },
  youtube: {
    badge: "bg-red-600 text-white",
    icon: "text-red-600"
  },
  default: {
    badge: "bg-gray-500 text-white",
    icon: "text-gray-500"
  }
} as const

export type PlatformKey = keyof Omit<typeof PLATFORM_STYLES, 'default'>

// Supported platform names in lowercase for validation
export const PLATFORM_NAMES = ['instagram', 'tiktok', 'youtube'] as const

export type PlatformName = typeof PLATFORM_NAMES[number]
