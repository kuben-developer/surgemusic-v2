export type SocialAccount = {
  _id: string
  platform: string
  username: string
  userImage: string
  profileUrl: string
  status: string
  connectedAt: string
  _creationTime: number
}

export type AyrshareProfile = {
  _id: string
  profileName: string
  totalAccounts: number
  createdAt: string
  profileKey?: string
  _creationTime: number
  socialAccounts: SocialAccount[]
}

export type ProfileWithAccounts = AyrshareProfile

export type ProfileCheckResult = {
  profileName: string
  message: string
  status: 'success' | 'error' | 'pending'
}

export type SyncDialogState = {
  isOpen: boolean
  profileCheckResults: ProfileCheckResult[]
  currentCheckIndex: number
  completedChecksCount: number
  isSyncingInProgress: boolean
}

export type CreateProfileDialogState = {
  isOpen: boolean
  profileName: string
  isCreating: boolean
}

export type DeleteProfileDialogState = {
  isOpen: boolean
  profileName: string | null
  isDeleting: boolean
}