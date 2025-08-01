import type { NavSection, ProjectItem, TeamItem } from "../types/navigation.types"

/**
 * Validates navigation section data
 */
export function validateNavSections(sections: NavSection[]): boolean {
  return Array.isArray(sections) && sections.every(section => 
    section.section && 
    Array.isArray(section.items) &&
    section.items.every(item => 
      item.title && 
      item.url && 
      item.icon !== undefined
    )
  )
}

/**
 * Validates project items
 */
export function validateProjects(projects: ProjectItem[]): boolean {
  return Array.isArray(projects) && projects.every(project =>
    project.name &&
    project.url &&
    typeof project.icon === 'function'
  )
}

/**
 * Validates team items
 */
export function validateTeams(teams: TeamItem[]): boolean {
  return Array.isArray(teams) && teams.every(team =>
    team.name &&
    team.plan &&
    typeof team.logo === 'function'
  )
}

/**
 * Gets safe user name from user object
 */
export function getSafeUserName(user: unknown): string {
  if (!user || typeof user !== 'object') return "User"
  
  const userObj = user as Record<string, unknown>
  const fullName = typeof userObj.fullName === 'string' ? userObj.fullName : ''
  const firstName = typeof userObj.firstName === 'string' ? userObj.firstName : ''
  const username = typeof userObj.username === 'string' ? userObj.username : ''
  
  return fullName || firstName || username || "User"
}

/**
 * Gets safe user email from user object
 */
export function getSafeUserEmail(user: unknown): string {
  if (!user || typeof user !== 'object') return ""
  
  const userObj = user as Record<string, unknown>
  const emailAddresses = userObj.emailAddresses
  
  if (!Array.isArray(emailAddresses) || emailAddresses.length === 0) return ""
  
  const firstEmail = emailAddresses[0]
  if (!firstEmail || typeof firstEmail !== 'object') return ""
  
  const emailObj = firstEmail as Record<string, unknown>
  return typeof emailObj.emailAddress === 'string' ? emailObj.emailAddress : ""
}

/**
 * Generates user initials from name
 */
export function generateUserInitials(name: string, maxLength: number = 2): string {
  if (!name) return "U"
  
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, maxLength) || "U"
}