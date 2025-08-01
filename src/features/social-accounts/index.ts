// Page export for app router
export { SocialAccountsPage } from './SocialAccountsPage'

// Component exports
export { ProfileCard } from './components/ProfileCard'
export { ProfileList } from './components/ProfileList'
export { ProfileHeader } from './components/ProfileHeader'
export { ProfileActions } from './components/ProfileActions'
export { ProfileContent } from './components/ProfileContent'
export { ProfileStats } from './components/ProfileStats'
export { SocialAccountCard } from './components/SocialAccountCard'
export { PlatformIcon } from './components/PlatformIcon'
export { SyncProgressBar } from './components/SyncProgressBar'
export { ProfileListColumn } from './components/ProfileListColumn'

// Dialog exports
export { CreateProfileDialog } from './dialogs/CreateProfileDialog'
export { DeleteProfileDialog } from './dialogs/DeleteProfileDialog'
export { SyncDialog } from './dialogs/SyncDialog'

// Hook exports
export { useProfiles } from './hooks/useProfiles'
export { useProfileActions } from './hooks/useProfileActions'
export { useProfileSync } from './hooks/useProfileSync'
export { useExpandedProfiles } from './hooks/useExpandedProfiles'
export { useSyncDialog } from './hooks/useSyncDialog'

// Constants and utils
export { PLATFORMS, PLATFORM_STYLES, PLATFORM_NAMES } from './constants/platforms'
export { 
  getPlatformIcon, 
  getPlatformColor, 
  getPlatformBadgeClass,
  formatPlatformName,
  isPlatformSupported
} from './utils/platform.utils'

// Types
export type { 
  SocialAccount, 
  ProfileWithAccounts, 
  ProfileCheckResult,
  CheckProfilesResult
} from './types/social-accounts.types'
export type { 
  SupportedPlatform,
  PlatformKey,
  PlatformName
} from './constants/platforms'