// Main page export
export { SocialAccountsPage } from './SocialAccountsPage'

// Hooks exports
export { useProfiles } from './hooks/useProfiles'
export { useProfileSync } from './hooks/useProfileSync'
export { useProfileActions } from './hooks/useProfileActions'

// Type exports
export type { 
  SocialAccount, 
  AyrshareProfile, 
  ProfileWithAccounts,
  ProfileCheckResult
} from './types/social-accounts.types'

// Component exports (if needed by other features)
export { ProfileList } from './components/ProfileList'
export { ProfileCard } from './components/ProfileCard'
export { SocialAccountCard } from './components/SocialAccountCard'
export { PlatformIcon } from './components/PlatformIcon'

// Utility exports
export { 
  getPlatformBadgeClass, 
  formatPlatformName, 
  isPlatformSupported 
} from './utils/platform.utils'