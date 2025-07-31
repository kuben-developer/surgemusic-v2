export const SUPPORTED_PLATFORMS = ['TikTok', 'Instagram', 'YouTube'] as const

export type SupportedPlatform = typeof SUPPORTED_PLATFORMS[number]

export const PLATFORM_COLORS = {
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
  }
} as const