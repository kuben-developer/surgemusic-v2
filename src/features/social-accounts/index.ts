// Page export for app router
export { SocialAccountsPage } from './SocialAccountsPage'

// Component exports
export { ProfileCard } from './components/ProfileCard'
export { ProfileList } from './components/ProfileList'
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
export { useSyncDialog } from './hooks/useSyncDialog'

// Constants and utils
export { PLATFORMS } from './constants/platforms'
export { getPlatformIcon, getPlatformColor } from './utils/platform.utils'

// Types
export type { 
  SocialAccount, 
  ProfileWithAccounts, 
  ProfileCheckResult 
} from './types/social-accounts.types'