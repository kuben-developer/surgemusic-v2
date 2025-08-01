export function getPlatformBadgeClass(platform: string) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    case "tiktok":
      return "bg-black text-white dark:bg-white dark:text-black"
    case "youtube":
      return "bg-red-600 text-white"
    default:
      return ""
  }
}

export function formatPlatformName(platform: string) {
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

export function isPlatformSupported(platform: string) {
  const supportedPlatforms = ['instagram', 'tiktok', 'youtube']
  return supportedPlatforms.includes(platform.toLowerCase())
}

export function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return "text-pink-500"
    case "tiktok":
      return "text-black dark:text-white"
    case "youtube":
      return "text-red-600"
    default:
      return "text-gray-500"
  }
}

export function getPlatformColor(platform: string) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    case "tiktok":
      return "bg-black text-white dark:bg-white dark:text-black"
    case "youtube":
      return "bg-red-600 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}
