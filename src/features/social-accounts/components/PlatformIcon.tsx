import { TikTokIcon, InstagramIcon, YouTubeIcon } from '@/components/common/icons'

interface PlatformIconProps {
  platform: string
  className?: string
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <InstagramIcon className={className || "w-5 h-5 text-pink-500"} />
    case "tiktok":
      return <TikTokIcon className={className || "w-5 h-5 text-black dark:text-white"} />
    case "youtube":
      return <YouTubeIcon className={className || "w-5 h-5 text-red-600"} />
    default:
      return null
  }
}