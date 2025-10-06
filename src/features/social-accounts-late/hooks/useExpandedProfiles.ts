"use client"

import { useState, useEffect } from "react"
import type { LateProfileWithAccounts } from '../types/social-accounts.types'

export function useExpandedProfiles(profiles: LateProfileWithAccounts[]) {
  const [expandedProfiles, setExpandedProfiles] = useState<string[]>([])

  // Set initially expanded profiles when data loads
  useEffect(() => {
    if (profiles.length > 0) {
      setExpandedProfiles(profiles.map(profile => profile.profileName))
    }
  }, [profiles])

  const toggleProfileExpansion = (profileName: string) => {
    setExpandedProfiles(prev =>
      prev.includes(profileName)
        ? prev.filter(n => n !== profileName)
        : [...prev, profileName]
    )
  }

  const expandAllProfiles = () => {
    setExpandedProfiles(profiles.map(profile => profile.profileName))
  }

  const collapseAllProfiles = () => {
    setExpandedProfiles([])
  }

  const isProfileExpanded = (profileName: string) => {
    return expandedProfiles.includes(profileName)
  }

  return {
    expandedProfiles,
    toggleProfileExpansion,
    expandAllProfiles,
    collapseAllProfiles,
    isProfileExpanded
  }
}
